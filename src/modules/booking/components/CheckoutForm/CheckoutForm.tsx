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
    pricing: { priceAdult: number; priceChild: number };
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

  // Ref para rastrear la última cantidad de pasajeros procesada
  const lastPassengersCountRef = useRef<{ adults: number; children: number } | null>(null);

  // Actualizar bookingData cuando cambian los pasajeros
  // Esto asegura que exceedsAvailability se actualice cuando se agregan/quitan pasajeros
  useEffect(() => {
    const currentAdults = passengers.filter((p) => p.esAdulto).length;
    const currentChildren = passengers.filter((p) => !p.esAdulto).length;
    
    const lastCount = lastPassengersCountRef.current;
    // Solo actualizar si la cantidad de pasajeros realmente cambió
    if (
      !lastCount ||
      lastCount.adults !== currentAdults ||
      lastCount.children !== currentChildren
    ) {
      lastPassengersCountRef.current = { adults: currentAdults, children: currentChildren };
      
      // Pequeño delay para asegurar que updatePendingBookingPassengers haya terminado
      setTimeout(() => {
        // Recargar bookingData desde localStorage (ya debería estar actualizado por updatePendingBookingPassengers)
        const updated = getPendingBooking();
        if (updated) {
          setBookingData((prev) => {
            // Solo actualizar si los valores realmente cambiaron
            if (
              !prev ||
              updated.adults !== prev.adults ||
              updated.children !== prev.children ||
              updated.exceedsAvailability !== prev.exceedsAvailability
            ) {
              return updated;
            }
            return prev;
          });
        }
      }, 0);
    }
  }, [passengers.length, passengers]);

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
    // Leer siempre la versión más reciente de la reserva pendiente
    const pending = getPendingBooking();
    const data = pending ?? bookingData;
    
    if (!data) return;
    
    if (!validateAllFields()) {
      return;
    }

    setIsSubmitting(true);

    // Usar datos más recientes de pendingBooking si están disponibles
    const exceedsAvailability = pending?.exceedsAvailability ?? data.exceedsAvailability;
    const adults = pending?.adults ?? data.adults;
    const children = pending?.children ?? data.children;

    // Determinar tipo de orden usando los datos más recientes
    const orderType: "reserva" | "consulta" = 
      exceedsAvailability || hasRestrictionViolations ? "consulta" : "reserva";

    // Crear orden con datos actualizados
    const order: Order = {
      orderId: generateOrderId(),
      tourId: data.tourId,
      tourTitle: data.tourTitle,
      date: data.date,
      adults,
      children,
      pricing: data.pricing,
      timeSlot: data.timeSlot,
      passengers,
      billingInfo,
      paymentMethod: selectedPaymentMethod,
      orderType,
      exceedsAvailability,
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
  // Ref para rastrear si el usuario está activamente editando campos
  const isUserEditingRef = useRef<boolean>(false);
  // Ref para rastrear el último momento en que el usuario editó un campo
  const lastEditTimeRef = useRef<number>(0);
  // Ref para rastrear la última cantidad de pasajeros (para detectar cuando se agregan nuevos)
  const lastPassengerCountRef = useRef<number>(0);

  // Marcar que el usuario está editando cuando cambian los pasajeros o billing info
  useEffect(() => {
    const currentPassengerCount = passengers.length;
    const passengerCountChanged = currentPassengerCount !== lastPassengerCountRef.current;
    
    // Si cambió la cantidad de pasajeros, puede ser que se agregó uno nuevo
    // En ese caso, marcar como "editando" pero con un delay más largo para evitar scroll inmediato
    if (passengerCountChanged) {
      lastPassengerCountRef.current = currentPassengerCount;
      // Cuando se agrega un pasajero nuevo, dar más tiempo antes de permitir scroll
      isUserEditingRef.current = true;
      lastEditTimeRef.current = Date.now();
      
      // Resetear el flag después de un delay más largo (2 segundos) cuando se agregan pasajeros
      const timeoutId = setTimeout(() => {
        isUserEditingRef.current = false;
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Si solo cambió el contenido (no la cantidad), el usuario está editando activamente
      isUserEditingRef.current = true;
      lastEditTimeRef.current = Date.now();
      
      // Resetear el flag después de un breve delay (500ms sin cambios)
      const timeoutId = setTimeout(() => {
        isUserEditingRef.current = false;
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [passengers, billingInfo]);

  // Hacer focus en el mensaje de validación solo cuando aparezcan errores por primera vez
  // Y solo si el usuario NO está activamente editando campos
  useEffect(() => {
    // Solo hacer scroll si:
    // 1. Cambió de false a true (errores aparecieron)
    // 2. El usuario NO está activamente editando (o pasó suficiente tiempo desde la última edición)
    const timeSinceLastEdit = Date.now() - lastEditTimeRef.current;
    const shouldScroll = 
      hasValidationErrors && 
      !prevHasValidationErrorsRef.current && 
      validationMessageRef.current &&
      (!isUserEditingRef.current || timeSinceLastEdit > 2000);
    
    if (shouldScroll) {
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

  // Opciones para provincias argentinas (23 provincias + CABA)
  const provinceOptions = [
    { value: "Buenos Aires", label: "Buenos Aires" },
    { value: "Catamarca", label: "Catamarca" },
    { value: "Chaco", label: "Chaco" },
    { value: "Chubut", label: "Chubut" },
    { value: "Ciudad Autónoma de Buenos Aires", label: "Ciudad Autónoma de Buenos Aires" },
    { value: "Córdoba", label: "Córdoba" },
    { value: "Corrientes", label: "Corrientes" },
    { value: "Entre Ríos", label: "Entre Ríos" },
    { value: "Formosa", label: "Formosa" },
    { value: "Jujuy", label: "Jujuy" },
    { value: "La Pampa", label: "La Pampa" },
    { value: "La Rioja", label: "La Rioja" },
    { value: "Mendoza", label: "Mendoza" },
    { value: "Misiones", label: "Misiones" },
    { value: "Neuquén", label: "Neuquén" },
    { value: "Río Negro", label: "Río Negro" },
    { value: "Salta", label: "Salta" },
    { value: "San Juan", label: "San Juan" },
    { value: "San Luis", label: "San Luis" },
    { value: "Santa Cruz", label: "Santa Cruz" },
    { value: "Santa Fe", label: "Santa Fe" },
    { value: "Santiago del Estero", label: "Santiago del Estero" },
    { value: "Tierra del Fuego", label: "Tierra del Fuego" },
    { value: "Tucumán", label: "Tucumán" },
  ];

  // Opciones para países (lista internacional completa)
  const countryOptions = [
    { value: "Argentina", label: "Argentina" },
    { value: "Chile", label: "Chile" },
    { value: "Uruguay", label: "Uruguay" },
    { value: "Brasil", label: "Brasil" },
    { value: "Paraguay", label: "Paraguay" },
    { value: "Bolivia", label: "Bolivia" },
    { value: "Perú", label: "Perú" },
    { value: "Colombia", label: "Colombia" },
    { value: "Ecuador", label: "Ecuador" },
    { value: "Venezuela", label: "Venezuela" },
    { value: "Estados Unidos", label: "Estados Unidos" },
    { value: "Canadá", label: "Canadá" },
    { value: "México", label: "México" },
    { value: "Reino Unido", label: "Reino Unido" },
    { value: "España", label: "España" },
    { value: "Francia", label: "Francia" },
    { value: "Alemania", label: "Alemania" },
    { value: "Italia", label: "Italia" },
    { value: "Portugal", label: "Portugal" },
    { value: "Países Bajos", label: "Países Bajos" },
    { value: "Bélgica", label: "Bélgica" },
    { value: "Suiza", label: "Suiza" },
    { value: "Austria", label: "Austria" },
    { value: "Australia", label: "Australia" },
    { value: "Nueva Zelanda", label: "Nueva Zelanda" },
    { value: "China", label: "China" },
    { value: "Japón", label: "Japón" },
    { value: "India", label: "India" },
    { value: "Corea del Sur", label: "Corea del Sur" },
    { value: "Israel", label: "Israel" },
    { value: "Sudáfrica", label: "Sudáfrica" },
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
            error={errors["billing.pais"]}
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
