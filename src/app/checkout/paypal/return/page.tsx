"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { OrderSummaryCard } from "@/components/common/OrderSummaryCard/OrderSummaryCard";
import { getCompletedOrderData } from "@/lib/utils/orderStorage";
import { usePaymentVerification } from "@/modules/booking/hooks/usePaymentVerification";
import styles from "./page.module.scss";

export default function PayPalReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<ReturnType<typeof getCompletedOrderData> | null>(null);
  const [captureStatus, setCaptureStatus] = useState<"idle" | "capturing" | "success" | "error">("idle");
  const [captureError, setCaptureError] = useState<string | null>(null);

  const token = searchParams.get("token");
  const payerId = searchParams.get("PayerID");
  const orderId = searchParams.get("orderId");

  // Obtener datos de la orden desde sessionStorage
  useEffect(() => {
    const savedOrderData = getCompletedOrderData();
    if (savedOrderData) {
      setOrderData(savedOrderData);
    }
  }, []);

  // Validar parámetros de PayPal
  const hasValidParams = token && payerId && orderId;

  // Capturar el pago de PayPal primero
  useEffect(() => {
    if (!hasValidParams || captureStatus !== "idle") return;

    const capturePayment = async () => {
      setCaptureStatus("capturing");
      try {
        const response = await fetch("/api/payments/paypal/capture", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paypalOrderId: token,
            orderId: orderId,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Error al capturar el pago");
        }

        setCaptureStatus("success");
      } catch (error) {
        setCaptureStatus("error");
        setCaptureError(error instanceof Error ? error.message : "Error al capturar el pago");
      }
    };

    capturePayment();
  }, [hasValidParams, token, orderId, captureStatus]);

  // Verificar estado del pago solo después de capturar exitosamente
  const shouldVerify = captureStatus === "success";
  // Priorizar orderId de la URL ya que es más confiable que sessionStorage
  // orderCode solo si no hay orderId y está disponible en orderData
  const { status, errorMessage } = usePaymentVerification({
    orderCode: !orderId && orderData?.code ? orderData.code : undefined,
    orderId: orderId || undefined,
    maxRetries: 3,
    retryDelay: 3000,
    enabled: shouldVerify,
    onSuccess: () => {
      setTimeout(() => {
        router.push("/checkout/success");
      }, 2000);
    },
  });

  // Determinar el estado final
  let finalStatus: "loading" | "success" | "error" = "loading";
  let finalErrorMessage: string | null = null;

  if (!hasValidParams) {
    finalStatus = "error";
    finalErrorMessage = "Parámetros de PayPal incompletos";
  } else if (captureStatus === "error") {
    finalStatus = "error";
    finalErrorMessage = captureError || "Error al capturar el pago de PayPal";
  } else if (captureStatus === "success" && status === "error") {
    finalStatus = "error";
    finalErrorMessage = errorMessage || "Error al verificar el estado del pago";
  } else if (captureStatus === "success" && status === "success") {
    finalStatus = "success";
  } else {
    finalStatus = "loading";
  }

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
