"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { CheckoutForm, type CheckoutFormRef } from "@/modules/content/components/CheckoutForm";
import { MiniCart } from "@/modules/content/components/MiniCart";
import { MiniCartSkeleton } from "@/modules/content/components/MiniCart/MiniCartSkeleton";
import { getFullTourById } from "@/modules/content/components/ToursGrid/tourFullData";
import { getPendingBooking, savePendingBooking } from "@/lib/utils/orderStorage";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getPriceByCurrency } from "@/lib/utils/priceFormat";
import type { Order, PaymentMethod, Pricing } from "@/lib/types/order";
import { PaymentModal } from "@/modules/content/components/PaymentModal/PaymentModal";
import styles from "./page.module.scss";

export default function CheckoutPage() {
  const router = useRouter();
  const { currency } = useCurrency();
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
      setBookingData(pending);
    } else {
      // Si no hay datos, redirigir al inicio
      router.push("/");
    }
  }, [router]);

  // Actualizar precios cuando cambia la moneda
  useEffect(() => {
    if (bookingData) {
      const tour = getFullTourById(bookingData.tourId);
      if (tour?.booking?.pricing) {
        const prices = getPriceByCurrency(tour.booking.pricing, currency);
        const updatedPricing: Pricing = {
          ...tour.booking.pricing,
          currency,
          priceAdult: prices.priceAdult,
          priceChild: prices.priceChild,
        };
        const updatedBooking = {
          ...bookingData,
          pricing: updatedPricing,
        };
        setBookingData(updatedBooking);
        // Actualizar localStorage también
        savePendingBooking(updatedBooking);
      }
    }
  }, [currency, bookingData?.tourId]);

  // Obtener restricciones del tour
  const tour = bookingData ? getFullTourById(bookingData.tourId) : null;
  const restriction = tour?.quickInfo?.restriction || "";
  const hasPregnancyRestriction = restriction.toLowerCase().includes("embarazada");
  const hasHealthRestriction = restriction.toLowerCase().includes("columna") || 
                               restriction.toLowerCase().includes("dolencias") ||
                               restriction.toLowerCase().includes("salud");

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleCheckoutComplete = (order: Order) => {
    setCompletedOrder(order);
    // Si es una reserva (no consulta), mostrar modal de pago
    if (order.orderType === "reserva") {
      setShowPaymentModal(true);
    } else {
      // Si es consulta, mostrar mensaje de éxito sin pago
      // TODO: Mostrar página de confirmación de consulta
      alert("Consulta generada exitosamente. Te contactaremos pronto.");
    }
  };

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
    <>
      <Hero variant="internal" pageKey="checkout" />
      <main className="mainContainer">
        <div className={styles.checkoutPage}>
          <div className={styles.leftColumn}>
            <CheckoutForm
              ref={checkoutFormRef}
              hasPregnancyRestriction={hasPregnancyRestriction}
              hasHealthRestriction={hasHealthRestriction}
              onCheckoutComplete={handleCheckoutComplete}
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
                exceedsAvailability={bookingData.exceedsAvailability}
                hasRestrictionViolations={hasRestrictionViolations}
                hasValidationErrors={hasValidationErrors}
                onPaymentMethodChange={handlePaymentMethodChange}
                onSubmit={handleSubmitFromCart}
              />
            )}
          </div>
        </div>
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
    </>
  );
}
