"use client";

import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Card } from "@/components/common/Card";
import { Message } from "@/components/common/Message";
import { Icon } from "@/components/icons/Icon";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button/Button";
import { PassengerForm } from "./PassengerForm";
import type { Passenger, BillingInfo, Order, PaymentMethod } from "@/lib/types/order";
import { getPendingBooking, generateOrderId, saveOrder, clearPendingBooking, updatePendingBookingPassengers } from "@/lib/utils/orderStorage";
import styles from "./CheckoutForm.module.scss";

interface CheckoutFormProps {
  /** Si el tour tiene restricciones para embarazadas */
  hasPregnancyRestriction?: boolean;
  /** Si el tour tiene restricciones para problemas de columna/salud */
  hasHealthRestriction?: boolean;
  /** Callback cuando se completa el checkout */
  onCheckoutComplete: (order: Order) => void;
  /** Callback cuando cambia el estado de violaciones de restricciones */
  onRestrictionViolationsChange?: (hasViolations: boolean) => void;
}

export interface CheckoutFormRef {
  submit: (paymentMethod?: PaymentMethod) => void;
  hasRestrictionViolations: boolean;
  hasValidationErrors: boolean;
}

/**
 * Componente principal del formulario de checkout
 */
export const CheckoutForm = forwardRef<CheckoutFormRef, CheckoutFormProps>(({
  hasPregnancyRestriction = false,
  hasHealthRestriction = false,
  onCheckoutComplete,
  onRestrictionViolationsChange,
}, ref) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<{
    tourId: string;
    tourTitle: string;
    date: string;
    adults: number;
    children: number;
    pricing: { currency: "ARS" | "USD"; priceAdult: number; priceChild: number };
    timeSlot: { start: string; end: string };
    exceedsAvailability: boolean;
  } | null>(null);

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    nombreCompleto: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
    pais: "Argentina",
    documento: "",
    notasPedido: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passengerToRemove, setPassengerToRemove] = useState<number | null>(null);
  const [isClosingModal, setIsClosingModal] = useState(false);

  // Cargar datos del localStorage al montar
  useEffect(() => {
    const pending = getPendingBooking();
    if (pending) {
      setBookingData(pending);
      
      // Inicializar pasajeros
      const initialPassengers: Passenger[] = [];
      
      // Crear pasajeros adultos
      for (let i = 0; i < pending.adults; i++) {
        initialPassengers.push({
          nombreCompleto: "",
          fechaNacimiento: "",
          documento: "",
          direccion: "",
          telefono: "",
          tieneRestriccionesAlimentarias: false,
          esAdulto: true,
          embarazada: undefined,
          problemasColumnaSalud: undefined,
        });
      }
      
      // Crear pasajeros niños
      for (let i = 0; i < pending.children; i++) {
        initialPassengers.push({
          nombreCompleto: "",
          fechaNacimiento: "",
          documento: "",
          direccion: "",
          telefono: "",
          tieneRestriccionesAlimentarias: false,
          esAdulto: false,
        });
      }
      
      setPassengers(initialPassengers);
    } else {
      // Si no hay datos, redirigir al inicio
      router.push("/");
    }
  }, [router]);

  // Actualizar pasajero
  const handlePassengerChange = (index: number, passenger: Passenger) => {
    const updated = [...passengers];
    updated[index] = passenger;
    setPassengers(updated);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar información de facturación
    if (!billingInfo.nombreCompleto.trim()) {
      newErrors["billing.nombreCompleto"] = "* El campo es obligatorio";
    }
    if (!billingInfo.apellidos.trim()) {
      newErrors["billing.apellidos"] = "* El campo es obligatorio";
    }
    if (!billingInfo.email.trim()) {
      newErrors["billing.email"] = "* El campo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingInfo.email)) {
      newErrors["billing.email"] = "* El email debe ser válido";
    }
    if (!billingInfo.telefono.trim()) {
      newErrors["billing.telefono"] = "* El campo es obligatorio";
    }
    if (!billingInfo.direccion.trim()) {
      newErrors["billing.direccion"] = "* El campo es obligatorio";
    }
    if (!billingInfo.ciudad.trim()) {
      newErrors["billing.ciudad"] = "* El campo es obligatorio";
    }
    if (!billingInfo.provincia.trim()) {
      newErrors["billing.provincia"] = "* El campo es obligatorio";
    }
    if (!billingInfo.codigoPostal.trim()) {
      newErrors["billing.codigoPostal"] = "* El campo es obligatorio";
    }
    if (!billingInfo.documento.trim()) {
      newErrors["billing.documento"] = "* El campo es obligatorio";
    }

    // Validar pasajeros
    passengers.forEach((passenger, index) => {
      if (!passenger.nombreCompleto.trim()) {
        newErrors[`passenger.${index}.nombreCompleto`] = "* El campo es obligatorio";
      }
      if (!passenger.fechaNacimiento) {
        newErrors[`passenger.${index}.fechaNacimiento`] = "* El campo es obligatorio";
      }
      if (!passenger.documento.trim()) {
        newErrors[`passenger.${index}.documento`] = "* El campo es obligatorio";
      }
      if (!passenger.direccion.trim()) {
        newErrors[`passenger.${index}.direccion`] = "* El campo es obligatorio";
      }
      if (!passenger.telefono.trim()) {
        newErrors[`passenger.${index}.telefono`] = "* El campo es obligatorio";
      }
      if (passenger.tieneRestriccionesAlimentarias === undefined) {
        newErrors[`passenger.${index}.restricciones`] = "* El campo es obligatorio";
      }
      if (passenger.tieneRestriccionesAlimentarias && passenger.restriccionesAlimentarias?.alergias && !passenger.restriccionesAlimentarias.alergiasDetalle?.trim()) {
        newErrors[`passenger.${index}.alergias`] = "* El campo es obligatorio";
      }
      
      // Validaciones para adultos
      if (passenger.esAdulto) {
        if (hasPregnancyRestriction && passenger.embarazada === undefined) {
          newErrors[`passenger.${index}.embarazada`] = "* El campo es obligatorio";
        }
        if (hasHealthRestriction && passenger.problemasColumnaSalud === undefined) {
          newErrors[`passenger.${index}.salud`] = "* El campo es obligatorio";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar si hay restricciones que impidan la reserva
  const hasRestrictionViolations = useMemo(() => {
    if (!hasPregnancyRestriction && !hasHealthRestriction) return false;
    
    return passengers.some((passenger) => {
      if (!passenger.esAdulto) return false;
      if (hasPregnancyRestriction && passenger.embarazada === true) return true;
      if (hasHealthRestriction && passenger.problemasColumnaSalud === true) return true;
      return false;
    });
  }, [passengers, hasPregnancyRestriction, hasHealthRestriction]);

  // Notificar cambios en violaciones de restricciones
  React.useEffect(() => {
    if (onRestrictionViolationsChange) {
      onRestrictionViolationsChange(hasRestrictionViolations);
    }
  }, [hasRestrictionViolations, onRestrictionViolationsChange]);

  // Manejar submit
  const handleSubmit = React.useCallback((selectedPaymentMethod?: PaymentMethod) => {
    if (!bookingData) return;
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Determinar tipo de orden
    const orderType: "reserva" | "consulta" = 
      bookingData.exceedsAvailability || hasRestrictionViolations ? "consulta" : "reserva";

    // Crear orden
    const order: Order = {
      orderId: generateOrderId(),
      tourId: bookingData.tourId,
      tourTitle: bookingData.tourTitle,
      date: bookingData.date,
      adults: bookingData.adults,
      children: bookingData.children,
      pricing: bookingData.pricing,
      timeSlot: bookingData.timeSlot,
      passengers,
      billingInfo,
      paymentMethod: selectedPaymentMethod,
      orderType,
      exceedsAvailability: bookingData.exceedsAvailability,
      createdAt: new Date().toISOString(),
    };

    // Guardar orden
    saveOrder(order);
    clearPendingBooking();

    // Llamar callback
    onCheckoutComplete(order);

    setIsSubmitting(false);
  }, [bookingData, passengers, billingInfo, hasRestrictionViolations, validateForm, onCheckoutComplete]);

  // Verificar si hay errores de validación
  const hasValidationErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  // Exponer función de submit y estado mediante ref
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    hasRestrictionViolations,
    hasValidationErrors,
  }), [hasRestrictionViolations, handleSubmit, hasValidationErrors]);

  if (!bookingData) {
    return (
      <div className={styles.loading}>
        <p>Cargando información de la reserva...</p>
      </div>
    );
  }

  // Opciones para provincias argentinas (ejemplo básico)
  const provinceOptions = [
    { value: "Tierra del Fuego", label: "Tierra del Fuego" },
    { value: "Buenos Aires", label: "Buenos Aires" },
    { value: "Córdoba", label: "Córdoba" },
    { value: "Santa Fe", label: "Santa Fe" },
    { value: "Mendoza", label: "Mendoza" },
    // Agregar más según necesidad
  ];

  const countryOptions = [
    { value: "Argentina", label: "Argentina" },
    { value: "Chile", label: "Chile" },
    { value: "Brasil", label: "Brasil" },
    { value: "Uruguay", label: "Uruguay" },
    // Agregar más según necesidad
  ];

  return (
    <div className={styles.checkoutForm}>
      {/* Información de facturación */}
      <Card title="Detalles de facturación" className={styles.section}>
        <div className={styles.formRow}>
          <Input
            label="Nombre"
            name="billing-nombre"
            required
            value={billingInfo.nombreCompleto}
            onChange={(e) => setBillingInfo({ ...billingInfo, nombreCompleto: e.target.value })}
            error={errors["billing.nombreCompleto"]}
            className={styles.formGroup}
          />
          <Input
            label="Apellidos"
            name="billing-apellidos"
            required
            value={billingInfo.apellidos}
            onChange={(e) => setBillingInfo({ ...billingInfo, apellidos: e.target.value })}
            error={errors["billing.apellidos"]}
            className={styles.formGroup}
          />
        </div>

        <div className={styles.formRow}>
          <Input
            label="Correo electrónico"
            name="billing-email"
            type="email"
            required
            value={billingInfo.email}
            onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
            error={errors["billing.email"]}
            className={styles.formGroup}
          />
          <Input
            label="Teléfono"
            name="billing-telefono"
            type="tel"
            required
            value={billingInfo.telefono}
            onChange={(e) => setBillingInfo({ ...billingInfo, telefono: e.target.value })}
            error={errors["billing.telefono"]}
            className={styles.formGroup}
          />
        </div>

        <div className={styles.formRow}>
          <Input
            label="Dirección de la calle"
            name="billing-direccion"
            required
            value={billingInfo.direccion}
            onChange={(e) => setBillingInfo({ ...billingInfo, direccion: e.target.value })}
            error={errors["billing.direccion"]}
            className={styles.formGroup}
          />
        </div>

        <div className={styles.formRow}>
          <Input
            label="Localidad / Ciudad"
            name="billing-ciudad"
            required
            value={billingInfo.ciudad}
            onChange={(e) => setBillingInfo({ ...billingInfo, ciudad: e.target.value })}
            error={errors["billing.ciudad"]}
            className={styles.formGroup}
          />
          <Select
            label="Región / Provincia / Departamento"
            name="billing-provincia"
            required
            options={provinceOptions}
            value={billingInfo.provincia}
            onChange={(e) => setBillingInfo({ ...billingInfo, provincia: e.target.value })}
            error={errors["billing.provincia"]}
            className={styles.formGroup}
          />
        </div>

        <div className={styles.formRow}>
          <Input
            label="Código postal"
            name="billing-codigoPostal"
            required
            value={billingInfo.codigoPostal}
            onChange={(e) => setBillingInfo({ ...billingInfo, codigoPostal: e.target.value })}
            error={errors["billing.codigoPostal"]}
            className={styles.formGroup}
          />
          <Select
            label="País / Región"
            name="billing-pais"
            required
            options={countryOptions}
            value={billingInfo.pais}
            onChange={(e) => setBillingInfo({ ...billingInfo, pais: e.target.value })}
            className={styles.formGroup}
          />
        </div>

        <div className={styles.formRow}>
          <Input
            label="DNI / CUIT / CUIL"
            name="billing-documento"
            required
            value={billingInfo.documento}
            onChange={(e) => setBillingInfo({ ...billingInfo, documento: e.target.value })}
            error={errors["billing.documento"]}
            className={styles.formGroup}
          />
        </div>
      </Card>

      {/* Información de pasajeros */}
      <Card title="Información de pasajeros" className={styles.section}>
        <p className={styles.sectionDescription}>
          Por favor ingrese: Nombre completo, DNI/Pasaporte y Fecha de nacimiento de cada pasajero.
        </p>

        <div className={styles.passengersList}>
          {passengers.map((passenger, index) => {
            // Extraer errores específicos de este pasajero
            const passengerErrors: Record<string, string> = {};
            Object.keys(errors).forEach((key) => {
              if (key.startsWith(`passenger.${index}.`)) {
                const field = key.replace(`passenger.${index}.`, "");
                passengerErrors[field] = errors[key];
              }
            });

            // Verificar si este pasajero tiene errores
            const hasErrors = Object.keys(passengerErrors).length > 0;

            return (
              <PassengerForm
                key={index}
                passengerNumber={index + 1}
                isAdult={passenger.esAdulto}
                passenger={passenger}
                onChange={(updated) => handlePassengerChange(index, updated)}
                hasPregnancyRestriction={hasPregnancyRestriction}
                hasHealthRestriction={hasHealthRestriction}
                errors={passengerErrors}
                hasErrors={hasErrors}
                canRemove={passengers.length > 1}
                onRemove={() => {
                  setPassengerToRemove(index);
                }}
              />
            );
          })}
        </div>

        <div className={styles.passengersActions}>
          <Button
            variant="outline"
            size="small"
            onClick={() => {
              setPassengers([
                ...passengers,
                {
                  nombreCompleto: "",
                  fechaNacimiento: "",
                  documento: "",
                  direccion: "",
                  telefono: "",
                  tieneRestriccionesAlimentarias: false,
                  esAdulto: true,
                  embarazada: undefined,
                  problemasColumnaSalud: undefined,
                },
              ]);
            }}
          >
            <Icon name="users" size={16} />
            Agregar adulto
          </Button>
          <Button
            size="small"
            variant="outline"
            onClick={() => {
              setPassengers([
                ...passengers,
                {
                  nombreCompleto: "",
                  fechaNacimiento: "",
                  documento: "",
                  direccion: "",
                  telefono: "",
                  tieneRestriccionesAlimentarias: false,
                  esAdulto: false,
                },
              ]);
            }}
          >
            <Icon name="users" size={16} />
            Agregar niño
          </Button>
        </div>
      </Card>

      {/* Información adicional */}
      <Card title="Información adicional" className={styles.section}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Notas del pedido (opcional)
            </label>
            <textarea
              name="notas-pedido"
              className={styles.textarea}
              value={billingInfo.notasPedido || ""}
              onChange={(e) => setBillingInfo({ ...billingInfo, notasPedido: e.target.value })}
              placeholder="Notas sobre tu pedido, por ejemplo, notas especiales para la entrega."
              rows={5}
            />
          </div>
        </div>
      </Card>

      {/* Modal de confirmación para eliminar pasajero */}
      <Modal
        isOpen={passengerToRemove !== null}
        isClosing={isClosingModal}
        title="Eliminar pasajero"
        size="small"
        onClose={() => {
          setIsClosingModal(true);
          setTimeout(() => {
            setPassengerToRemove(null);
            setIsClosingModal(false);
          }, 200);
        }}
      >
        <p>
          ¿Estás seguro de que deseas eliminar este pasajero? Esta acción no se puede deshacer.
        </p>
        <div className={styles.confirmModalActions}>
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              if (passengerToRemove !== null) {
                const updated = passengers.filter((_, i) => i !== passengerToRemove);
                setPassengers(updated);
                // Actualizar localStorage
                const adults = updated.filter((p) => p.esAdulto).length;
                const children = updated.filter((p) => !p.esAdulto).length;
                updatePendingBookingPassengers(adults, children);
                // Limpiar errores de este pasajero
                const newErrors = { ...errors };
                Object.keys(newErrors).forEach((key) => {
                  if (key.startsWith(`passenger.${passengerToRemove}.`)) {
                    delete newErrors[key];
                  }
                });
                // Reindexar errores de pasajeros posteriores
                const reindexedErrors: Record<string, string> = {};
                Object.keys(newErrors).forEach((key) => {
                  if (key.startsWith("passenger.")) {
                    const match = key.match(/^passenger\.(\d+)\.(.+)$/);
                    if (match) {
                      const oldIndex = parseInt(match[1]);
                      const field = match[2];
                      if (oldIndex > passengerToRemove) {
                        reindexedErrors[`passenger.${oldIndex - 1}.${field}`] = newErrors[key];
                      } else if (oldIndex < passengerToRemove) {
                        reindexedErrors[key] = newErrors[key];
                      }
                    }
                  } else {
                    reindexedErrors[key] = newErrors[key];
                  }
                });
                setErrors(reindexedErrors);
              }
              setIsClosingModal(true);
              setTimeout(() => {
                setPassengerToRemove(null);
                setIsClosingModal(false);
              }, 200);
            }}
          >
            Eliminar
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => {
              setIsClosingModal(true);
              setTimeout(() => {
                setPassengerToRemove(null);
                setIsClosingModal(false);
              }, 200);
            }}
          >
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
});

CheckoutForm.displayName = "CheckoutForm";

