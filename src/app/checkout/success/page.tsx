"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Button } from "@/components/common/Button/Button";
import { Icon } from "@/components/icons/Icon";
import { OrderDetails } from "@/components/common/OrderDetails";
import { OrderSummaryCard } from "@/components/common/OrderSummaryCard";
import { PaymentDetails } from "@/components/common/PaymentDetails";
import { getCompletedOrderData, type CompletedOrderData } from "@/lib/utils/orderStorage";
import { generateOrderWhatsAppLink } from "@/lib/utils/whatsapp";
import styles from "./page.module.scss";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<CompletedOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener datos desde sessionStorage en lugar de URL
    const completedData = getCompletedOrderData();
    
    if (completedData) {
      setOrderData(completedData);
    } else {
      // Si no hay datos, redirigir al inicio
      router.push("/");
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Cargando...</p>
      </div>
    );
  }

  const isEnquiry = orderData?.type === "ENQUIRY";

  // Generar link de WhatsApp para consultas
  const whatsappLink = orderData && isEnquiry
    ? generateOrderWhatsAppLink({
        code: orderData.code,
        tourTitle: orderData.tourTitle,
        date: orderData.date,
        timeSlot: orderData.timeSlot,
        adults: orderData.adults,
        children: orderData.children,
        totalAmount: orderData.totalAmount,
        currency: orderData.currency,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        passengers: orderData.passengers,
      })
    : null;

  return (
    <>
      <Hero variant="internal" pageKey="checkout" />
      <main className="mainContainer">
        <div className={styles.successPage}>
          <div className={styles.successIcon}>
            <Icon name="check" size={64} />
          </div>

          <h1 className={styles.title}>
            {isEnquiry 
              ? "Consulta enviada exitosamente" 
              : orderData?.paymentMethod === "transferencia"
              ? "¡Reserva creada exitosamente!"
              : "¡Reserva confirmada!"}
          </h1>
          
          {!isEnquiry && orderData?.paymentMethod === "transferencia" && (
            <p className={styles.subtitle}>
              Tu reserva está pendiente de pago. Por favor, realiza la transferencia bancaria según las instrucciones que recibiste por email.
            </p>
          )}
          
          {!isEnquiry && (orderData?.paymentMethod === "paypal" || orderData?.paymentMethod === "payway") && (
            <p className={styles.subtitle}>
              Tu pago ha sido procesado exitosamente. Recibirás el comprobante por correo electrónico.
            </p>
          )}

          {orderData && (
            <>
              <OrderSummaryCard
                orderData={orderData}
                showTotal={true}
                showMessage={true}
                messageVariant={isEnquiry ? "info" : "success"}
              />

              <div className={styles.orderDetailsWrapper}>
                <OrderDetails
                  tourTitle={orderData.tourTitle}
                  date={orderData.date}
                  timeSlot={orderData.timeSlot}
                  adults={orderData.adults}
                  numChildren={orderData.children}
                  passengers={orderData.passengers}
                />
                
                {/* Mostrar detalles del pago solo para reservas confirmadas */}
                {!isEnquiry && (
                  <PaymentDetails
                    paymentMethod={orderData.paymentMethod}
                    totalAmount={orderData.totalAmount}
                    currency={orderData.currency}
                    orderCode={orderData.code}
                  />
                )}
              </div>
            </>
          )}

          <div className={styles.actions}>
            {isEnquiry && whatsappLink && (
              <Button
                variant="primary"
                href={whatsappLink}
                className={styles.whatsappButton}
              >
                <Icon name="whatsapp" size={20} />
                Enviar consulta por WhatsApp
              </Button>
            )}
            <Button
              variant={isEnquiry ? "outline" : "primary"}
              onClick={() => router.push("/")}
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

