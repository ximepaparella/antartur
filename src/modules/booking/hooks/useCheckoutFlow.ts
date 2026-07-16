/**
 * Hook para manejar el flujo completo de checkout
 * Encapsula la lógica de guardar datos y redirigir según tipo de orden y método de pago
 */

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/types/order";
import { calculateOrderTotal } from "@/lib/utils/pricing";
import { saveCompletedOrderData } from "@/lib/utils/orderStorage";
import { usePaymentRedirect } from "./usePaymentRedirect";

export interface UseCheckoutFlowReturn {
  handleCheckoutComplete: (order: Order) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
  showPaywayModal: boolean;
  paywayOrderData: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
  } | null;
  onPaywayPaymentSuccess: () => void;
  onPaywayModalClose: () => void;
}

/**
 * Hook para manejar el flujo completo de checkout
 * Maneja guardado de datos y redirección según tipo de orden y método de pago
 */
export function useCheckoutFlow(): UseCheckoutFlowReturn {
  const router = useRouter();
  const { initiatePayment, isRedirecting, error: paymentError } = usePaymentRedirect();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showPaywayModal, setShowPaywayModal] = useState(false);
  const [paywayOrderData, setPaywayOrderData] = useState<{
    orderId: string;
    amount: number;
    currency: string;
    description: string;
  } | null>(null);
  
  // Ref para evitar stale closure en finally block
  const isRedirectingRef = useRef(isRedirecting);
  
  // Mantener ref sincronizado con el state
  useEffect(() => {
    isRedirectingRef.current = isRedirecting;
  }, [isRedirecting]);

  const handleCheckoutComplete = useCallback(
    async (order: Order) => {
      setIsNavigating(true);
      
      try {
        // Guardar datos en sessionStorage en lugar de pasarlos por URL (más seguro)
        const orderData = {
          code: order.orderId,
          customerName: order.billingInfo.nombreCompleto,
          customerEmail: order.billingInfo.email,
          customerPhone: order.billingInfo.telefono,
          whatsappNumber: order.whatsappNumber,
          totalAmount: calculateOrderTotal(order.adults, order.children, order.pricing),
          currency: order.pricing.currencyCode,
          type: order.orderType === "consulta" ? ("ENQUIRY" as const) : ("RESERVATION" as const),
          paymentMethod: order.paymentMethod,
          // Detalles de la orden
          tourTitle: order.tourTitle,
          date: order.date,
          timeSlot: order.timeSlot,
          adults: order.adults,
          children: order.children,
          additionals: order.additionals?.map((additional) => ({
            name: additional.name,
          })),
          notes: order.billingInfo.notasPedido,
          passengers: order.passengers.map((p) => ({
            nombreCompleto: p.nombreCompleto,
            fechaNacimiento: p.fechaNacimiento,
            documento: p.documento,
            direccion: p.direccion,
            telefono: p.telefono,
            esAdulto: p.esAdulto,
            embarazada: p.embarazada,
            problemasColumnaSalud: p.problemasColumnaSalud,
            restriccionesAlimentarias: p.restriccionesAlimentarias,
          })),
        };

        saveCompletedOrderData(orderData);

        // Redirigir según tipo de orden y método de pago
        if (order.orderType === "consulta") {
          // Consulta: redirigir a página de éxito con código de orden
          router.push(`/checkout/success?code=${order.orderId}`);
        } else if (order.orderType === "reserva") {
          // Reserva: redirigir según método de pago
          if (order.paymentMethod === "transferencia") {
            // Transferencia bancaria: mostrar página de transferencia
            router.push("/checkout/transfer");
          } else if (order.paymentMethod === "paypal") {
            // PayPal: usar hook para iniciar pago y redirect
            await initiatePayment({
              orderId: order.orderId,
              amount: orderData.totalAmount,
              currency: orderData.currency,
              paymentMethod: "paypal",
              customerEmail: orderData.customerEmail,
              customerName: orderData.customerName,
            });
          } else if (order.paymentMethod === "payway") {
            // Payway: mostrar modal en lugar de redirect
            setPaywayOrderData({
              orderId: order.orderId,
              amount: orderData.totalAmount,
              currency: orderData.currency,
              description: `Orden ${order.orderId} - ${order.tourTitle}`,
            });
            setShowPaywayModal(true);
            setIsNavigating(false); // No navegar, mostrar modal
          } else {
            // Sin método de pago: redirigir a éxito con código de orden
            router.push(`/checkout/success?code=${order.orderId}`);
          }
        }
      } finally {
        // Usar ref para evitar stale closure - leer valor actual
        if (!isRedirectingRef.current) {
          setIsNavigating(false);
        }
      }
    },
    [router, initiatePayment]
  );

  // Combinar estados de procesamiento
  const isProcessing = isNavigating || isRedirecting;

  // Callback cuando el pago de Payway es exitoso
  const onPaywayPaymentSuccess = useCallback(() => {
    setShowPaywayModal(false);
    setPaywayOrderData(null);
    // Redirigir a página de éxito
    if (paywayOrderData) {
      router.push(`/checkout/success?orderId=${paywayOrderData.orderId}`);
    }
  }, [router, paywayOrderData]);

  // Callback para cerrar el modal de Payway
  const onPaywayModalClose = useCallback(() => {
    setShowPaywayModal(false);
    setPaywayOrderData(null);
  }, []);

  return {
    handleCheckoutComplete,
    isProcessing,
    error: paymentError,
    showPaywayModal,
    paywayOrderData,
    onPaywayPaymentSuccess,
    onPaywayModalClose,
  };
}

