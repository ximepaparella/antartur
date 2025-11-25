"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { CheckoutForm, type CheckoutFormRef } from "@/modules/booking/components/CheckoutForm";
import { MiniCart } from "@/modules/booking/components/MiniCart";
import { MiniCartSkeleton } from "@/modules/booking/components/MiniCart/MiniCartSkeleton";
import { toursClient } from "@/modules/tours/api/client/toursClient";
import { getPendingBooking, savePendingBooking } from "@/lib/utils/orderStorage";
import type { Order, PaymentMethod, Pricing } from "@/lib/types/order";
import { PaymentModal } from "@/modules/booking/components/PaymentModal/PaymentModal";
import { RouteErrorBoundary, FeatureErrorBoundary } from "@/components/common/ErrorBoundary";
import { useCheckoutFlow } from "@/modules/booking/hooks/useCheckoutFlow";
import styles from "./page.module.scss";

export default function CheckoutPage() {
  const router = useRouter();
  const { handleCheckoutComplete } = useCheckoutFlow();
  const [bookingData, setBookingData] = useState<{
    tourId: string;
    tourTitle: string;
    date: string;
    adults: number;
    children: number;
    pricing: Pricing;
    timeSlot: { start: string; end: string };
    exceedsAvailability: boolean;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transferencia");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [hasRestrictionViolations, setHasRestrictionViolations] = useState(false);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const [isUpdatingPassengers, setIsUpdatingPassengers] = useState(false);
  
  // Ref para acceder a CheckoutForm
  const checkoutFormRef = React.useRef<CheckoutFormRef>(null);

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

  useEffect(() => {
    if (bookingData?.tourId) {
      // tourId es el slug en este contexto
      toursClient.client.getBySlug(bookingData.tourId, { includeContent: true })
        .then((tour) => {
          if (tour) {
            const tourRestriction = tour.restrictionText || "";
            setRestriction(tourRestriction);
            setHasPregnancyRestriction(tourRestriction.toLowerCase().includes("embarazada"));
            setHasHealthRestriction(
              tourRestriction.toLowerCase().includes("columna") ||
              tourRestriction.toLowerCase().includes("dolencias") ||
              tourRestriction.toLowerCase().includes("salud")
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener restricciones del tour:", error);
        });
    }
  }, [bookingData?.tourId]);

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

  return (
    <RouteErrorBoundary>
      <Hero variant="internal" pageKey="checkout" />
      <main className="mainContainer">
        <FeatureErrorBoundary featureName="reserva">
          <div className={styles.checkoutPage}>
            <div className={styles.leftColumn}>
              <CheckoutForm
                ref={checkoutFormRef}
                hasPregnancyRestriction={hasPregnancyRestriction}
                hasHealthRestriction={hasHealthRestriction}
                onCheckoutComplete={onCheckoutComplete}
                onRestrictionViolationsChange={handleRestrictionViolationsChange}
                onPassengersChange={handlePassengersChange}
                onValidationErrorsChange={handleValidationErrorsChange}
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
                  hasRestrictionViolations={hasRestrictionViolations}
                  hasValidationErrors={hasValidationErrors}
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
