"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { CheckoutForm, type CheckoutFormRef } from "@/modules/booking/components/CheckoutForm";
import { MiniCart } from "@/modules/booking/components/MiniCart";
import { MiniCartSkeleton } from "@/modules/booking/components/MiniCart/MiniCartSkeleton";
import { LoadingOverlay } from "@/components/common/LoadingOverlay/LoadingOverlay";
import { toursClient } from "@/modules/tours/api/client/toursClient";
import { getPendingBooking, savePendingBooking } from "@/lib/utils/orderStorage";
import type { Order, PaymentMethod, Pricing, SelectedAdditional } from "@/lib/types/order";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { TourAdditional } from "@/modules/tours/types/tourTypes";
import { PaymentModal } from "@/modules/booking/components/PaymentModal/PaymentModal";
import { RouteErrorBoundary, FeatureErrorBoundary } from "@/components/common/ErrorBoundary";
import { useCheckoutFlow } from "@/modules/booking/hooks/useCheckoutFlow";
import { Message } from "@/components/common/Message";
import styles from "./page.module.scss";

export default function CheckoutPage() {
  const router = useRouter();
  const { handleCheckoutComplete, isProcessing, error: checkoutError } = useCheckoutFlow();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<{
    tourId: string;
    tourTitle: string;
    date: string;
    adults: number;
    children: number;
    pricing: Pricing;
    timeSlot: { start: string; end: string };
    exceedsAvailability: boolean;
    additionals?: SelectedAdditional[];
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transferencia");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [hasRestrictionViolations, setHasRestrictionViolations] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const [isUpdatingPassengers, setIsUpdatingPassengers] = useState(false);
  
  // Ref para acceder a CheckoutForm
  const checkoutFormRef = React.useRef<CheckoutFormRef>(null);
  
  // Callback para sincronizar estado de submit del formulario
  const handleSubmittingChange = useCallback((isSubmitting: boolean) => {
    setIsFormSubmitting(isSubmitting);
  }, []);

  useEffect(() => {
    const pending = getPendingBooking();
    if (pending) {
      // Asegurar que pricing tenga currencyCode (migración de datos antiguos)
      if (!pending.pricing.currencyCode) {
        pending.pricing.currencyCode = "ARS"; // Default para datos antiguos
        // Persistir la migración para evitar re-ejecutarla en cada carga
        savePendingBooking(pending);
      }
      setBookingData(pending);
    } else {
      // Si no hay datos, redirigir al inicio
      router.push("/");
    }
  }, [router]);

  // Obtener restricciones del tour desde la API
  const [restriction, setRestriction] = useState("");
  const [hasPregnancyRestriction, setHasPregnancyRestriction] = useState(false);
  const [hasHealthRestriction, setHasHealthRestriction] = useState(false);
  const [tourMinAge, setTourMinAge] = useState<number | null>(null);
  const [allowsInfants, setAllowsInfants] = useState(false);
  const [tourAdditionals, setTourAdditionals] = useState<TourAdditional[]>([]);
  const { currency } = useCurrency();

  useEffect(() => {
    if (bookingData?.tourId) {
      // tourId es el slug en este contexto
      toursClient.client.getBySlug(bookingData.tourId, { includeContent: true })
        .then((tour) => {
          if (tour) {
            // Guardar additionals del tour
            if (tour.additionals && Array.isArray(tour.additionals)) {
              setTourAdditionals(tour.additionals);
            }
            // Concatenar todas las restricciones: restrictionText (legacy) + restrictions (array)
            const restrictionParts: string[] = [];
            if (tour.restrictionText) {
              restrictionParts.push(tour.restrictionText);
            }
            if (tour.restrictions && Array.isArray(tour.restrictions)) {
              tour.restrictions.forEach((r: { text: string }) => {
                if (r.text) {
                  restrictionParts.push(r.text);
                }
              });
            }
            const allRestrictions = restrictionParts.join(" ");
            const restrictionLower = allRestrictions.toLowerCase();
            setRestriction(allRestrictions);
            
            // Detectar restricciones de embarazo con múltiples variantes
            const pregnancyKeywords = [
              "embarazada",
              "embarazo",
              "gestante",
              "gestación",
              "embarazadas",
            ];
            setHasPregnancyRestriction(
              pregnancyKeywords.some(keyword => restrictionLower.includes(keyword))
            );
            
            // Detectar restricciones de salud/físicas con múltiples variantes
            // Solo buscar frases específicas para evitar falsos positivos
            const healthKeywords = [
              "restricciones físicas",
              "restricciones médicas",
              "restricciones de salud",
              "problemas de salud",
              "problemas de columna",
              "dolencias",
              "discapacidad",
              "movilidad reducida",
              "no recomendado para personas con",
              "no apto para personas con",
            ];
            // Solo considerar como restricción de salud si aparece en contexto específico
            setHasHealthRestriction(
              healthKeywords.some(keyword => restrictionLower.includes(keyword))
            );
            
            setTourMinAge(tour.minAge ?? null);
            // Obtener allowsInfants del tour (puede venir en restrictions o directamente del tour)
            setAllowsInfants(tour.allowsInfants ?? false);
          }
        })
        .catch((error) => {
          console.error("Error al obtener restricciones del tour:", error);
        });
    }
  }, [bookingData?.tourId]);

  // Actualizar additionals cuando cambia la moneda
  useEffect(() => {
    if (bookingData?.additionals && bookingData.additionals.length > 0 && tourAdditionals.length > 0) {
      // Crear un mapa de additionals por ID para acceso rápido
      const additionalsMap = new Map(tourAdditionals.map(a => [a.id, a]));
      
      // Actualizar cada additional seleccionado con el precio de la nueva moneda
      const updated = bookingData.additionals.map(selected => {
        const originalAdditional = additionalsMap.get(selected.additionalId);
        if (originalAdditional) {
          const prices = originalAdditional.prices[currency as "ARS" | "USD"];
          if (prices) {
            return {
              ...selected,
              priceAdult: prices.adult,
              priceChild: prices.child,
              currency,
            };
          }
        }
        return selected;
      }).filter(selected => {
        // Filtrar additionals que no tienen precio en la nueva moneda
        const originalAdditional = additionalsMap.get(selected.additionalId);
        return originalAdditional?.prices[currency as "ARS" | "USD"];
      });
      
      // Solo actualizar si hay cambios
      const hasChanges = updated.length !== bookingData.additionals.length || 
        updated.some((u, i) => {
          const old = bookingData.additionals![i];
          return u.currency !== old.currency || u.priceAdult !== old.priceAdult;
        });
      
      if (hasChanges) {
        const updatedBookingData = {
          ...bookingData,
          additionals: updated,
        };
        setBookingData(updatedBookingData);
        savePendingBooking(updatedBookingData);
      }
    }
  }, [currency, tourAdditionals]); // No incluir bookingData.additionals para evitar loops

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const onCheckoutComplete = useCallback(
    async (order: Order) => {
      setCompletedOrder(order);
      await handleCheckoutComplete(order);
    },
    [handleCheckoutComplete]
  );

  const handleSubmitFromCart = (method?: PaymentMethod) => {
    // Solo actualizar paymentMethod si se proporciona
    if (method) {
      setPaymentMethod(method);
    }
    // Trigger submit en CheckoutForm
    if (checkoutFormRef.current) {
      checkoutFormRef.current.submit(method);
    }
  };

  const handleRestrictionViolationsChange = useCallback((hasViolations: boolean) => {
    setHasRestrictionViolations(hasViolations);
  }, []);

  const handleValidationErrorsChange = useCallback((hasErrors: boolean) => {
    setHasValidationErrors(hasErrors);
  }, []);

  // Ref para almacenar los valores previos de pasajeros y evitar actualizaciones innecesarias
  const prevPassengersRef = useRef<{ adults: number; children: number } | null>(null);
  const bookingDataRef = useRef(bookingData);
  
  // Mantener bookingDataRef actualizado
  useEffect(() => {
    bookingDataRef.current = bookingData;
  }, [bookingData]);

  const handlePassengersChange = useCallback((adults: number, children: number) => {
    // Solo actualizar si los valores realmente cambiaron
    const prev = prevPassengersRef.current;
    if (prev && prev.adults === adults && prev.children === children) {
      return;
    }
    
    prevPassengersRef.current = { adults, children };
    
    if (bookingDataRef.current) {
      setIsUpdatingPassengers(true);
      // Recargar datos actualizados desde localStorage
      const updated = getPendingBooking();
      if (updated) {
        setBookingData(updated);
      }
      // Simular un pequeño delay para mostrar el skeleton
      setTimeout(() => {
        setIsUpdatingPassengers(false);
      }, 300);
    }
  }, []);


  if (!bookingData) {
    return (
      <div className={styles.loading}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Combinar estados de procesamiento: del formulario y del flujo de checkout
  const isAnyProcessing = isProcessing || isFormSubmitting;

  return (
    <RouteErrorBoundary>
      {/* Loading overlay que bloquea toda la página - fuera del main para asegurar z-index */}
      {isAnyProcessing && <LoadingOverlay message="Procesando tu reserva..." />}
      <Hero variant="internal" pageKey="checkout" />
      <main className="mainContainer">
        {/* Mostrar error de checkout si existe */}
        {checkoutError && (
          <div className={styles.errorBanner}>
            <Message variant="alert">{checkoutError}</Message>
          </div>
        )}
        <FeatureErrorBoundary featureName="reserva">
          <div className={styles.checkoutPage}>
            <div className={styles.leftColumn}>
              <CheckoutForm
                ref={checkoutFormRef}
                hasPregnancyRestriction={hasPregnancyRestriction}
                hasHealthRestriction={hasHealthRestriction}
                minAge={tourMinAge}
                allowsInfants={allowsInfants}
                onCheckoutComplete={onCheckoutComplete}
                onRestrictionViolationsChange={handleRestrictionViolationsChange}
                onPassengersChange={handlePassengersChange}
                onValidationErrorsChange={handleValidationErrorsChange}
                onSubmittingChange={handleSubmittingChange}
              />
            </div>
            <div className={styles.rightColumn}>
              {isUpdatingPassengers ? (
                <MiniCartSkeleton />
              ) : (
                <MiniCart
                  tourTitle={bookingData.tourTitle}
                  date={bookingData.date}
                  timeSlot={`${bookingData.timeSlot.start} – ${bookingData.timeSlot.end}`}
                  adults={bookingData.adults}
                  childrenCount={bookingData.children}
                  pricing={bookingData.pricing}
                  tourId={bookingData.tourId}
                  exceedsAvailability={bookingData.exceedsAvailability}
                  additionals={bookingData.additionals}
                  hasRestrictionViolations={hasRestrictionViolations}
                  hasValidationErrors={hasValidationErrors}
                  isProcessing={isProcessing}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onSubmit={handleSubmitFromCart}
                />
              )}
            </div>
          </div>
        </FeatureErrorBoundary>
      </main>

      {showPaymentModal && completedOrder && (
        <PaymentModal
          order={completedOrder}
          paymentMethod={paymentMethod}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={() => {
            setShowPaymentModal(false);
            // TODO: Redirigir a página de confirmación
            alert("Pago procesado exitosamente");
          }}
        />
      )}
    </RouteErrorBoundary>
  );
}
