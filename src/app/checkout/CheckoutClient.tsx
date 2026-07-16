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
import { PaywayPaymentModal } from "@/modules/payments/components/PaywayPaymentModal";
import { RouteErrorBoundary, FeatureErrorBoundary } from "@/components/common/ErrorBoundary";
import { useCheckoutFlow } from "@/modules/booking/hooks/useCheckoutFlow";
import { Message } from "@/components/common/Message";
import type { AllPaymentMethods } from "@/modules/payments/api/server/paymentsServer";
import styles from "./page.module.scss";

interface CheckoutClientProps {
  allPaymentMethods: AllPaymentMethods;
  onlineBookingsEnabled: boolean;
  whatsappNumber: string | null;
}

export function CheckoutClient({
  allPaymentMethods,
  onlineBookingsEnabled,
  whatsappNumber,
}: CheckoutClientProps) {
  const router = useRouter();
  const {
    handleCheckoutComplete,
    isProcessing,
    error: checkoutError,
    showPaywayModal,
    paywayOrderData,
    onPaywayPaymentSuccess,
    onPaywayModalClose,
  } = useCheckoutFlow();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<{
    tourId: string;
    tourTitle: string;
    date: string;
    adults: number;
    children: number;
    infants?: number;
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
      }
      
      // Migrar additionals antiguos que no tienen prices
      if (pending.additionals && pending.additionals.length > 0) {
        pending.additionals = pending.additionals.map((additional: any) => {
          // Si el additional no tiene prices, agregar un objeto vacío
          // El efecto de cambio de moneda intentará completarlo desde tourAdditionals
          if (!additional.prices) {
            return {
              ...additional,
              prices: {},
            } as SelectedAdditional;
          }
          return additional as SelectedAdditional;
        });
      }
      
      // Persistir la migración para evitar re-ejecutarla en cada carga
      savePendingBooking(pending);
      
      // Debug temporal
      if (process.env.NODE_ENV === 'development') {
        console.log('[Checkout Debug] Datos cargados:', {
          additionals: pending.additionals,
          additionalsLength: pending.additionals?.length,
          todosLosDatos: pending,
        });
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
            setHasHealthRestriction(
              healthKeywords.some(keyword => restrictionLower.includes(keyword))
            );
            
            setTourMinAge(tour.minAge ?? null);
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
    if (!bookingData?.additionals || bookingData.additionals.length === 0) {
      return;
    }
    
    if (tourAdditionals.length === 0) {
      return;
    }
    
    const additionalsMap = new Map(tourAdditionals.map(a => [a.id, a]));
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Checkout Currency Change]', {
        currency,
        tourAdditionals: tourAdditionals.map(a => ({ id: a.id, name: a.name, prices: a.prices })),
        selectedAdditionals: bookingData.additionals.map(a => ({ 
          additionalId: a.additionalId, 
          name: a.name, 
          priceAdult: a.priceAdult, 
          currency: a.currency 
        })),
      });
    }
    
    const updated = bookingData.additionals.map(selected => {
      const pricesInNewCurrency = selected.prices?.[currency as "ARS" | "USD"];
      
      if (pricesInNewCurrency) {
        const newPriceAdult = pricesInNewCurrency.adult;
        const newPriceChild = pricesInNewCurrency.child;
        
        return {
          ...selected,
          priceAdult: newPriceAdult,
          priceChild: newPriceChild,
          currency,
        };
      } else {
        const originalAdditional = additionalsMap.get(selected.additionalId);
        if (originalAdditional) {
          const prices = originalAdditional.prices[currency as "ARS" | "USD"];
          if (prices) {
            const newPriceAdult = prices.adult;
            const newPriceChild = prices.child;
            
            const updatedPrices = {
              ...selected.prices,
              [currency]: { adult: newPriceAdult, child: newPriceChild },
            };
            
            return {
              ...selected,
              priceAdult: newPriceAdult,
              priceChild: newPriceChild,
              currency,
              prices: updatedPrices,
            };
          }
        }
      }
      
      return selected;
    });
    
    const hasChanges = updated.some((u, i) => {
      const old = bookingData.additionals![i];
      return u.currency !== old.currency || u.priceAdult !== old.priceAdult || u.priceChild !== old.priceChild;
    });
    
    if (hasChanges) {
      const updatedBookingData = {
        ...bookingData,
        additionals: updated,
      };
      setBookingData(updatedBookingData);
      savePendingBooking(updatedBookingData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, tourAdditionals]);

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
    if (method) {
      setPaymentMethod(method);
    }
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

  const handleRemoveAdditional = useCallback((additionalId: string) => {
    if (bookingData?.additionals) {
      const updated = bookingData.additionals.filter(
        (a) => a.additionalId !== additionalId
      );
      const updatedBookingData = {
        ...bookingData,
        additionals: updated.length > 0 ? updated : undefined,
      };
      setBookingData(updatedBookingData);
      savePendingBooking(updatedBookingData);
    }
  }, [bookingData]);

  const prevPassengersRef = useRef<{ adults: number; children: number } | null>(null);
  const bookingDataRef = useRef(bookingData);
  
  useEffect(() => {
    bookingDataRef.current = bookingData;
  }, [bookingData]);

  const handlePassengersChange = useCallback((adults: number, children: number) => {
    const prev = prevPassengersRef.current;
    if (prev && prev.adults === adults && prev.children === children) {
      return;
    }
    
    prevPassengersRef.current = { adults, children };
    
    if (bookingDataRef.current) {
      setIsUpdatingPassengers(true);
      const updated = getPendingBooking();
      if (updated) {
        setBookingData(updated);
      }
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

  const isAnyProcessing = isProcessing || isFormSubmitting;

  return (
    <RouteErrorBoundary>
      {isAnyProcessing && <LoadingOverlay message="Procesando tu reserva..." />}
      <Hero variant="internal" pageKey="checkout" />
      <main className="mainContainer">
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
                whatsappNumber={whatsappNumber}
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
                  infantsCount={bookingData.infants || 0}
                  pricing={bookingData.pricing}
                  tourId={bookingData.tourId}
                  exceedsAvailability={bookingData.exceedsAvailability}
                  additionals={bookingData.additionals || []}
                  onRemoveAdditional={handleRemoveAdditional}
                  hasRestrictionViolations={hasRestrictionViolations}
                  hasValidationErrors={hasValidationErrors}
                  isProcessing={isProcessing}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onSubmit={handleSubmitFromCart}
                  allPaymentMethods={allPaymentMethods}
                  onlineBookingsEnabled={onlineBookingsEnabled}
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
            alert("Pago procesado exitosamente");
          }}
        />
      )}

      {/* Modal de pago Payway */}
      {showPaywayModal && paywayOrderData && (
        <PaywayPaymentModal
          isOpen={showPaywayModal}
          onClose={onPaywayModalClose}
          orderId={paywayOrderData.orderId}
          amount={paywayOrderData.amount}
          currency={paywayOrderData.currency}
          description={paywayOrderData.description}
          onPaymentSuccess={onPaywayPaymentSuccess}
          onPaymentError={(error) => {
            // El error ya se muestra en el modal
            console.error("Payway payment error:", error);
          }}
        />
      )}
    </RouteErrorBoundary>
  );
}
