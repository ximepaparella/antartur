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

  // Mapear estados de Payway a nuestros estados
  const mapPaywayStatus = (paywayStatus: string | null): "success" | "error" | "pending" => {
    switch (paywayStatus?.toLowerCase()) {
      case "success":
      case "approved":
      case "completed":
        return "success";
      case "pending":
      case "in_process":
        return "pending";
      default:
        return "error";
    }
  };

  const paywayStatus = mapPaywayStatus(statusParam);
  const finalStatus = !hasValidParams ? "error" : paywayStatus === "success" ? "success" : status;
  const finalErrorMessage = !hasValidParams
    ? "Parámetros de Payway incompletos"
    : paywayStatus === "error" && statusParam
    ? `El pago fue ${statusParam === "failure" ? "rechazado" : statusParam === "cancelled" ? "cancelado" : "no procesado"}`
    : errorMessage;

  // Redirigir a success si el pago fue exitoso
  useEffect(() => {
    if (finalStatus === "success" && !isRedirecting) {
      setIsRedirecting(true);
      clearPendingBooking();
      // Pequeño delay para mostrar mensaje de éxito
      setTimeout(() => {
        router.push("/checkout/success");
      }, 1500);
    }
  }, [finalStatus, isRedirecting, router]);

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
