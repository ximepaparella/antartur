"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Button } from "@/components/common/Button/Button";
import { Icon } from "@/components/icons/Icon";
import { OrderSummaryCard } from "@/components/common/OrderSummaryCard";
import { getCompletedOrderData } from "@/lib/utils/orderStorage";
import { generateOrderWhatsAppLink } from "@/lib/utils/whatsapp";
import styles from "./page.module.scss";

export default function PaymentErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<ReturnType<typeof getCompletedOrderData> | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const reasonParam = searchParams.get("reason");
    
    // Intentar obtener datos desde sessionStorage
    const savedOrderData = getCompletedOrderData();
    if (savedOrderData) {
      setOrderData(savedOrderData);
    }
    
    if (reasonParam) {
      setReason(reasonParam);
    }
  }, [searchParams]);

  const getErrorMessage = () => {
    switch (reason) {
      case "cancelled":
        return "El pago fue cancelado. Puedes intentar nuevamente cuando estés listo.";
      case "paypal_error":
        return "Hubo un error al procesar el pago con PayPal. Por favor, intenta nuevamente.";
      case "payway_error":
        return "Hubo un error al procesar el pago con Payway. Por favor, intenta nuevamente.";
      default:
        return "Hubo un problema procesando tu pago. Por favor, contacta con soporte si el problema persiste.";
    }
  };

  const whatsappLink = orderData && orderData.code && orderData.tourTitle
    ? generateOrderWhatsAppLink({
        code: orderData.code,
        tourTitle: orderData.tourTitle,
        date: orderData.date || "",
        timeSlot: orderData.timeSlot || { start: "", end: "" },
        adults: orderData.adults || 0,
        children: orderData.children || 0,
        totalAmount: orderData.totalAmount || 0,
        currency: orderData.currency || "USD",
        customerName: orderData.customerName || "",
        customerPhone: orderData.customerPhone || "",
        passengers: orderData.passengers || [],
      })
    : null;

  return (
    <>
      <Hero variant="internal" pageKey="checkout" />
      <main className="mainContainer">
        <div className={styles.errorPage}>
          <div className={styles.errorIcon}>
            <Icon name="alert-circle" size={64} />
          </div>

          <h1 className={styles.title}>Error en el proceso de pago</h1>
          
          <p className={styles.message}>{getErrorMessage()}</p>

          {orderData && (
            <>
              <OrderSummaryCard
                orderData={orderData}
                showTotal={true}
                showMessage={false}
              />

              <div className={styles.actions}>
                {whatsappLink && (
                  <Button
                    variant="primary"
                    href={whatsappLink}
                  >
                    <Icon name="whatsapp" size={20} />
                    Contactar por WhatsApp
                  </Button>
                )}
                
                {orderData.paymentMethod === "paypal" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Redirigir a intentar pago PayPal nuevamente
                      router.push(`/checkout?retry=paypal&orderId=${orderData.code}`);
                    }}
                  >
                    Reintentar pago con PayPal
                  </Button>
                )}
                
                {orderData.paymentMethod === "payway" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Redirigir a intentar pago Payway nuevamente
                      router.push(`/checkout?retry=payway&orderId=${orderData.code}`);
                    }}
                  >
                    Reintentar pago con Payway
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                >
                  Volver al inicio
                </Button>
              </div>
            </>
          )}

          {!orderData && (
            <div className={styles.actions}>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
              >
                Volver al inicio
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

