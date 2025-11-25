"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { OrderSummaryCard } from "@/components/common/OrderSummaryCard/OrderSummaryCard";
import { getCompletedOrderData } from "@/lib/utils/orderStorage";
import { usePaymentVerification } from "@/modules/booking/hooks/usePaymentVerification";
import styles from "./page.module.scss";

export default function PayPalReturnPage() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<ReturnType<typeof getCompletedOrderData> | null>(null);

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
  const hasValidParams = token && payerId;

  // Verificar estado del pago usando hook reutilizable
  const { status, errorMessage } = usePaymentVerification({
    orderCode: orderData?.code,
    orderId: orderId || undefined,
    maxRetries: 3,
    retryDelay: 3000,
  });

  // Si no hay parámetros válidos, mostrar error
  const finalStatus = !hasValidParams ? "error" : status;
  const finalErrorMessage = !hasValidParams
    ? "Parámetros de PayPal incompletos"
    : errorMessage;

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
