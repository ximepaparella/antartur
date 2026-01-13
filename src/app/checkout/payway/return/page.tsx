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
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const orderId = searchParams.get("orderId");
  const statusParam = searchParams.get("status");
  const transactionId = searchParams.get("transaction_id") || searchParams.get("transactionId");
  const signature = searchParams.get("signature");
  const amount = searchParams.get("amount");

  // Obtener datos de la orden desde sessionStorage
  useEffect(() => {
    const savedOrderData = getCompletedOrderData();
    if (savedOrderData) {
      setOrderData(savedOrderData);
    }
  }, []);

  // Validar parámetros de Payway
  const hasValidParams = orderId || orderData?.code;
  const hasPaywayParams = orderId && transactionId;

  // Verificar el pago con Payway primero (similar a PayPal capture)
  useEffect(() => {
    if (!hasPaywayParams || verifyStatus !== "idle") return;

    const verifyPayment = async () => {
      setVerifyStatus("verifying");
      try {
        const response = await fetch("/api/payments/payway/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            transactionId: transactionId,
            status: statusParam || undefined,
            signature: signature || undefined,
            amount: amount || undefined,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || result.data?.message || "Error al verificar el pago");
        }

        // Si el pago fue verificado y confirmado exitosamente
        if (result.data?.verified && result.data?.status === "approved") {
          setVerifyStatus("success");
        } else {
          // Pago verificado pero no confirmado (pendiente, rechazado, etc.)
          setVerifyStatus("success"); // Marcamos como success para continuar con verificación
          setVerifyError(result.data?.message || "El pago no pudo ser confirmado");
        }
      } catch (error) {
        setVerifyStatus("error");
        setVerifyError(error instanceof Error ? error.message : "Error al verificar el pago");
      }
    };

    verifyPayment();
  }, [hasPaywayParams, orderId, transactionId, statusParam, signature, amount, verifyStatus]);

  // Verificar estado del pago usando hook reutilizable (solo después de verificar con Payway)
  const shouldVerify = verifyStatus === "success" || (!hasPaywayParams && hasValidParams);
  const { status, errorMessage } = usePaymentVerification({
    orderCode: orderData?.code,
    orderId: orderId || undefined,
    maxRetries: 3,
    retryDelay: 3000,
    enabled: shouldVerify,
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

  // Determinar el estado final
  // Si estamos verificando con Payway, mostrar loading
  // Si la verificación falló, mostrar error
  // Si la verificación fue exitosa, usar el estado de usePaymentVerification
  let finalStatus: "loading" | "success" | "error" = "loading";
  let finalErrorMessage: string | null = null;

  if (verifyStatus === "verifying") {
    finalStatus = "loading";
  } else if (verifyStatus === "error") {
    finalStatus = "error";
    finalErrorMessage = verifyError || "Error al verificar el pago con Payway";
  } else if (verifyStatus === "success" && shouldVerify) {
    // Después de verificar con Payway, usar el estado de usePaymentVerification
    finalStatus = !hasValidParams ? "error" : status;
    finalErrorMessage = !hasValidParams
      ? "Parámetros de Payway incompletos"
      : errorMessage || verifyError || getPaywayStatusMessage(statusParam) || "Error desconocido al procesar el pago";
  } else if (!hasPaywayParams && hasValidParams) {
    // Si no hay parámetros de Payway pero hay orderId, solo verificar estado de la orden
    finalStatus = status;
    finalErrorMessage = errorMessage || getPaywayStatusMessage(statusParam) || null;
  } else if (!hasValidParams) {
    finalStatus = "error";
    finalErrorMessage = "Parámetros de Payway incompletos";
  }

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
