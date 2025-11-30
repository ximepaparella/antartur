/**
 * Hook para manejar el flujo completo de checkout
 * Encapsula la lógica de guardar datos y redirigir según tipo de orden y método de pago
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/types/order";
import { calculateOrderTotal } from "@/lib/utils/pricing";
import { saveCompletedOrderData } from "@/lib/utils/orderStorage";
import { usePaymentRedirect } from "./usePaymentRedirect";

export interface UseCheckoutFlowReturn {
  handleCheckoutComplete: (order: Order) => Promise<void>;
}

/**
 * Hook para manejar el flujo completo de checkout
 * Maneja guardado de datos y redirección según tipo de orden y método de pago
 */
export function useCheckoutFlow(): UseCheckoutFlowReturn {
  const router = useRouter();
  const { initiatePayment } = usePaymentRedirect();

  const handleCheckoutComplete = useCallback(
    async (order: Order) => {
      // Guardar datos en sessionStorage en lugar de pasarlos por URL (más seguro)
      const orderData = {
        code: order.orderId,
        customerName: order.billingInfo.nombreCompleto,
        customerEmail: order.billingInfo.email,
        customerPhone: order.billingInfo.telefono,
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
        passengers: order.passengers.map((p) => ({
          nombreCompleto: p.nombreCompleto,
          esAdulto: p.esAdulto,
        })),
      };

      saveCompletedOrderData(orderData);

      // Redirigir según tipo de orden y método de pago
      if (order.orderType === "consulta") {
        // Consulta: redirigir a página de éxito
        router.push("/checkout/success");
      } else if (order.orderType === "reserva") {
        // Reserva: redirigir según método de pago
        if (order.paymentMethod === "transferencia") {
          // Transferencia bancaria: mostrar página de transferencia
          router.push("/checkout/transfer");
        } else if (order.paymentMethod === "paypal" || order.paymentMethod === "payway") {
          // PayPal o Payway: usar hook para iniciar pago y redirect
          await initiatePayment({
            orderId: order.orderId,
            amount: orderData.totalAmount,
            currency: orderData.currency,
            paymentMethod: order.paymentMethod,
            customerEmail: orderData.customerEmail,
            customerName: orderData.customerName,
          });
        } else {
          // Sin método de pago: redirigir a éxito
          router.push("/checkout/success");
        }
      }
    },
    [router, initiatePayment]
  );

  return {
    handleCheckoutComplete,
  };
}

