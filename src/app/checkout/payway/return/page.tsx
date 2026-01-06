"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { OrderSummaryCard } from "@/components/common/OrderSummaryCard/OrderSummaryCard";
import { getCompletedOrderData, clearPendingBooking } from "@/lib/utils/orderStorage";
import { usePaymentVerification } from "@/modules/booking/hooks/usePaymentVerification";
import styles from "./page.module.scss";

export default function PaywayReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<ReturnType<typeof getCompletedOrderData> | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const orderId = searchParams.get("orderId");
  const statusParam = searchParams.get("status");

  // Obtener datos de la orden desde sessionStorage
  useEffect(() => {
    const savedOrderData = getCompletedOrderData();
    if (savedOrderData) {
      setOrderData(savedOrderData);
    }
  }, []);

  // Validar parámetros de Payway
  const hasValidParams = orderId || orderData?.code;

  // Verificar estado del pago usando hook reutilizable
  const { status, errorMessage } = usePaymentVerification({
    orderCode: orderData?.code,
    orderId: orderId || undefined,
    maxRetries: 3,
    retryDelay: 3000,
  });

  // Mapear estados de Payway a mensajes de UI (solo para display, NO para lógica)
  const getPaywayStatusMessage = (paywayStatus: string | null): string | null => {
    switch (paywayStatus?.toLowerCase()) {
      case "failure":
        return "El pago fue rechazado";
      case "cancelled":
        return "El pago fue cancelado";
      case "pending":
      case "in_process":
        return "El pago está pendiente de confirmación";
      default:
        return paywayStatus ? `Estado del provider: ${paywayStatus}` : null;
    }
  };

  // IMPORTANTE: Confiar SOLO en la verificación del servidor, no en parámetros del provider
  // El statusParam solo se usa para mensajes de UI, nunca para determinar éxito
  const finalStatus = !hasValidParams ? "error" : status;
  
  // Mensaje de error: priorizar mensaje del servidor, usar mensaje del provider solo como fallback para UI
  const providerMessage = getPaywayStatusMessage(statusParam);
  const finalErrorMessage = !hasValidParams
    ? "Parámetros de Payway incompletos"
    : errorMessage || providerMessage || "Error desconocido al procesar el pago";

  // Redirigir a success si el pago fue exitoso
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (finalStatus === "success" && !isRedirecting) {
      setIsRedirecting(true);
      clearPendingBooking();
      // Pequeño delay para mostrar mensaje de éxito
      timeoutId = setTimeout(() => {
        // Pasar orderId o orderCode en la URL para que la página de éxito pueda cargar la orden
        const successUrl = orderId 
          ? `/checkout/success?orderId=${orderId}`
          : orderData?.code 
          ? `/checkout/success?code=${orderData.code}`
          : "/checkout/success";
        router.push(successUrl);
      }, 1500);
    }

    // Cleanup: cancelar timeout si el componente se desmonta o el effect se re-ejecuta
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [finalStatus, isRedirecting, router, orderId, orderData]);

  if (finalStatus === "loading") {
    return (
      <>
        <Hero variant="internal" pageKey="checkout" />
        <main className="mainContainer">
          <div className={styles.paypalReturn}>
            <div className={styles.loading}>
              <p>Verificando tu pago...</p>
              <p className={styles.subtitle}>Por favor espera un momento</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (finalStatus === "error") {
    return (
      <>
        <Hero variant="internal" pageKey="checkout" />
        <main className="mainContainer">
          <div className={styles.paypalReturn}>
            <div className={styles.error}>
              <h1>Error en el pago</h1>
              <p>{finalErrorMessage || "Hubo un problema procesando tu pago"}</p>
              {orderData && (
                <div className={styles.orderInfo}>
                  <OrderSummaryCard
                    orderData={orderData}
                    showTotal={true}
                    showMessage={false}
                  />
                </div>
              )}
              <div className={styles.actions}>
                <button
                  onClick={() => window.location.href = "/checkout/payment-error"}
                  className={styles.button}
                >
                  Ver detalles del error
                </button>
                <button
                  onClick={() => window.location.href = "/"}
                  className={styles.buttonSecondary}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Hero variant="internal" pageKey="checkout" />
      <main className="mainContainer">
        <div className={styles.paypalReturn}>
          <div className={styles.success}>
            <h1>Pago procesado exitosamente</h1>
            <p>Redirigiendo a la página de confirmación...</p>
          </div>
        </div>
      </main>
    </>
  );
}
