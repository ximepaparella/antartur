"use client";

import React, { useState, useEffect, useMemo, useCallback, useImperativeHandle, forwardRef, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Card } from "@/components/common/Card";
import { Message } from "@/components/common/Message";
import { Icon } from "@/components/icons/Icon";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button/Button";
import { PassengerForm } from "./PassengerForm";
import type { Passenger, BillingInfo, Order, PaymentMethod } from "@/lib/types/order";
import { getPendingBooking, generateOrderId, saveOrder, clearPendingBooking } from "@/lib/utils/orderStorage";
import { useCheckoutState } from "./hooks/useCheckoutState";
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
  /** Callback cuando cambia el número de pasajeros */
  onPassengersChange?: (adults: number, children: number) => void;
  /** Callback cuando cambia el estado de errores de validación */
  onValidationErrorsChange?: (hasErrors: boolean) => void;
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
  onPassengersChange,
  onValidationErrorsChange,
}, ref) => {
  const router = useRouter();
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passengerToRemove, setPassengerToRemove] = useState<number | null>(null);
  const [isClosingModal, setIsClosingModal] = useState(false);

  // Inicializar pasajeros y billing info desde localStorage
  const [initialPassengers, setInitialPassengers] = useState<Passenger[]>([]);
  const [initialBillingInfo] = useState<BillingInfo>({
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

  // Cargar datos del localStorage al montar
  useEffect(() => {
    const pending = getPendingBooking();
    if (pending) {
      setBookingData(pending);
      
      // Inicializar pasajeros
      const passengers: Passenger[] = [];
      
      // Crear pasajeros adultos
      for (let i = 0; i < pending.adults; i++) {
        passengers.push({
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
        passengers.push({
          nombreCompleto: "",
          fechaNacimiento: "",
          documento: "",
          direccion: "",
          telefono: "",
          tieneRestriccionesAlimentarias: false,
          esAdulto: false,
        });
      }
      
      setInitialPassengers(passengers);
    } else {
      // Si no hay datos, redirigir al inicio
      router.push("/");
    }
  }, [router]);

  // Usar hook centralizado de estado
  const {
    passengers,
    billingInfo,
    errors,
    hasValidationErrors,
    hasRestrictionViolations,
    isValid,
    updateBillingInfo,
    updatePassenger,
    replacePassenger,
    addPassenger,
    removePassenger,
    validateBilling,
    validatePassenger,
    validateAllFields,
  } = useCheckoutState({
    initialPassengers,
    initialBillingInfo,
    hasPregnancyRestriction,
    hasHealthRestriction,
    onPassengersChange,
  });

  // Notificar cambios en violaciones de restricciones
  useEffect(() => {
    if (onRestrictionViolationsChange) {
      onRestrictionViolationsChange(hasRestrictionViolations);
    }
  }, [hasRestrictionViolations, onRestrictionViolationsChange]);

  // Notificar cambios en errores de validación
  useEffect(() => {
    if (onValidationErrorsChange) {
      onValidationErrorsChange(hasValidationErrors);
    }
  }, [hasValidationErrors, onValidationErrorsChange]);

  // Manejar submit
  const handleSubmit = useCallback((selectedPaymentMethod?: PaymentMethod) => {
    if (!bookingData) return;
    
    if (!validateAllFields()) {
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
  }, [bookingData, passengers, billingInfo, hasRestrictionViolations, validateAllFields, onCheckoutComplete]);

  // Ref para el mensaje de validación (para hacer focus)
  const validationMessageRef = useRef<HTMLDivElement>(null);
  const prevHasValidationErrorsRef = useRef<boolean>(false);

  // Hacer focus en el mensaje de validación solo cuando aparezcan errores por primera vez
  useEffect(() => {
    // Solo hacer scroll si cambió de false a true (errores aparecieron)
    if (hasValidationErrors && !prevHasValidationErrorsRef.current && validationMessageRef.current) {
      validationMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      validationMessageRef.current.focus();
    }
    // Actualizar el ref con el valor actual
    prevHasValidationErrorsRef.current = hasValidationErrors;
  }, [hasValidationErrors]);

  // Exponer función de submit y estado mediante ref
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    hasRestrictionViolations,
    hasValidationErrors,
  }), [hasRestrictionViolations, handleSubmit, hasValidationErrors]);

  if (!bookingData || initialPassengers.length === 0) {
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
      {/* Mensaje de validación general */}
      {hasValidationErrors && (
        <div
          ref={validationMessageRef}
          tabIndex={-1}
          className={styles.validationMessage}
        >
          <Message variant="alert">
            <p>
              Por favor, completa todos los campos requeridos antes de continuar.
            </p>
          </Message>
        </div>
      )}

      {/* Información de facturación */}
      <Card title="Detalles de facturación" className={styles.section}>
        <div className={styles.formRow}>
          <Input
            label="Nombre"
            name="billing-nombre"
            required
            value={billingInfo.nombreCompleto}
            onChange={(e) => updateBillingInfo({ nombreCompleto: e.target.value })}
            onBlur={(e) => validateBilling("nombreCompleto", e.target.value)}
            error={errors["billing.nombreCompleto"]}
            className={styles.formGroup}
          />
          <Input
            label="Apellidos"
            name="billing-apellidos"
            required
            value={billingInfo.apellidos}
            onChange={(e) => updateBillingInfo({ apellidos: e.target.value })}
            onBlur={(e) => validateBilling("apellidos", e.target.value)}
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
            onChange={(e) => updateBillingInfo({ email: e.target.value })}
            onBlur={(e) => validateBilling("email", e.target.value)}
            error={errors["billing.email"]}
            className={styles.formGroup}
          />
          <Input
            label="Teléfono"
            name="billing-telefono"
            type="tel"
            required
            value={billingInfo.telefono}
            onChange={(e) => updateBillingInfo({ telefono: e.target.value })}
            onBlur={(e) => validateBilling("telefono", e.target.value)}
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
            onChange={(e) => updateBillingInfo({ direccion: e.target.value })}
            onBlur={(e) => validateBilling("direccion", e.target.value)}
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
            onChange={(e) => updateBillingInfo({ ciudad: e.target.value })}
            onBlur={(e) => validateBilling("ciudad", e.target.value)}
            error={errors["billing.ciudad"]}
            className={styles.formGroup}
          />
          <Select
            label="Región / Provincia / Departamento"
            name="billing-provincia"
            required
            options={provinceOptions}
            value={billingInfo.provincia}
            onChange={(e) => {
              updateBillingInfo({ provincia: e.target.value });
              validateBilling("provincia", e.target.value);
            }}
            onBlur={(e) => validateBilling("provincia", e.target.value)}
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
            onChange={(e) => updateBillingInfo({ codigoPostal: e.target.value })}
            onBlur={(e) => validateBilling("codigoPostal", e.target.value)}
            error={errors["billing.codigoPostal"]}
            className={styles.formGroup}
          />
          <Select
            label="País / Región"
            name="billing-pais"
            required
            options={countryOptions}
            value={billingInfo.pais}
            onChange={(e) => {
              updateBillingInfo({ pais: e.target.value });
              validateBilling("pais", e.target.value);
            }}
            onBlur={(e) => validateBilling("pais", e.target.value)}
            className={styles.formGroup}
          />
        </div>

        <div className={styles.formRow}>
          <Input
            label="DNI / CUIT / CUIL"
            name="billing-documento"
            required
            value={billingInfo.documento}
            onChange={(e) => updateBillingInfo({ documento: e.target.value })}
            onBlur={(e) => validateBilling("documento", e.target.value)}
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
                onChange={(updated) => replacePassenger(index, updated)}
                onValidateField={() => validatePassenger(index)}
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
            onClick={() => addPassenger(true)}
          >
            <Icon name="users" size={16} />
            Agregar adulto
          </Button>
          <Button
            size="small"
            variant="outline"
            onClick={() => addPassenger(false)}
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
              onChange={(e) => updateBillingInfo({ notasPedido: e.target.value })}
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
                removePassenger(passengerToRemove);
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
