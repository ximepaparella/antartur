"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Button } from "@/components/common/Button/Button";
import { Card } from "@/components/common/Card";
import { Message } from "@/components/common/Message";
import { Icon } from "@/components/icons/Icon";
import { OrderDetails } from "@/components/common/OrderDetails";
import { OrderSummaryCard } from "@/components/common/OrderSummaryCard";
import { getPendingBooking, getOrder, type CompletedOrderData } from "@/lib/utils/orderStorage";
import { generateOrderWhatsAppLink } from "@/lib/utils/whatsapp";
import { calculateOrderTotal } from "@/lib/utils/pricing";
import styles from "./page.module.scss";

export default function CheckoutErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<CompletedOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const error = searchParams.get("error");
    const code = searchParams.get("code");
    
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    } else {
      setErrorMessage("Ocurrió un error al procesar tu reserva. Por favor, intenta nuevamente.");
    }
    
    if (code) {
      setOrderCode(code);
    }

    // Intentar obtener datos de la reserva fallida
    // 1. Intentar desde orden guardada si hay código
    if (code) {
      const savedOrder = getOrder(code);
      if (savedOrder) {
        setOrderData({
          code: savedOrder.orderId,
          customerName: savedOrder.billingInfo.nombreCompleto,
          customerEmail: savedOrder.billingInfo.email,
          customerPhone: savedOrder.billingInfo.telefono,
          totalAmount: calculateOrderTotal(savedOrder.adults, savedOrder.children, savedOrder.pricing),
          currency: savedOrder.pricing.currencyCode,
          type: savedOrder.orderType === "consulta" ? "ENQUIRY" as const : "RESERVATION" as const,
          tourTitle: savedOrder.tourTitle,
          date: savedOrder.date,
          timeSlot: savedOrder.timeSlot,
          adults: savedOrder.adults,
          children: savedOrder.children,
          passengers: savedOrder.passengers.map(p => ({
            nombreCompleto: p.nombreCompleto,
            esAdulto: p.esAdulto,
          })),
        });
        setIsLoading(false);
        return;
      }
    }

    // 2. Intentar desde reserva pendiente
    const pendingBooking = getPendingBooking();
    if (pendingBooking) {
      // Construir datos básicos desde la reserva pendiente
      // Nota: No tenemos información de pasajeros ni billing info aquí
      setOrderData({
        code: code || "PENDIENTE",
        customerName: "",
        customerEmail: "",
        totalAmount: calculateOrderTotal(
          pendingBooking.adults,
          pendingBooking.children,
          pendingBooking.pricing
        ),
        currency: pendingBooking.pricing.currencyCode,
        tourTitle: pendingBooking.tourTitle,
        date: pendingBooking.date,
        timeSlot: pendingBooking.timeSlot,
        adults: pendingBooking.adults,
        children: pendingBooking.children,
        passengers: [], // No tenemos datos de pasajeros en pendingBooking
      });
    }

    setIsLoading(false);
  }, [searchParams]);

  // Generar link de WhatsApp con extracto de la reserva fallida
  // Mostrar botón si tenemos al menos los datos básicos de la reserva
  const whatsappLink = orderData && orderData.tourTitle
    ? generateOrderWhatsAppLink({
        code: orderData.code || "PENDIENTE",
        tourTitle: orderData.tourTitle,
        date: orderData.date,
        timeSlot: orderData.timeSlot,
        adults: orderData.adults,
        children: orderData.children,
        totalAmount: orderData.totalAmount,
        currency: orderData.currency,
        customerName: orderData.customerName || "Cliente",
        customerPhone: orderData.customerPhone,
        passengers: orderData.passengers || [],
      })
    : null;

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <>
      <Hero variant="internal" pageKey="checkout" />
      <main className="mainContainer">
        <div className={styles.errorPage}>
          <div className={styles.errorIcon}>
            <Icon name="alert-circle" size={64} />
          </div>

          <h1 className={styles.title}>Error al procesar la reserva</h1>

          <Card className={styles.errorCard}>
            <Message variant="alert">
              <p>{errorMessage}</p>
            </Message>

            {orderCode && (
              <div className={styles.orderCode}>
                <strong>Código de orden:</strong> {orderCode}
              </div>
            )}
          </Card>

          {/* Mostrar detalles de la reserva si están disponibles */}
          {orderData && orderData.tourTitle && (
            <>
              <OrderSummaryCard
                orderData={orderData}
                showTotal={true}
                showMessage={false}
              />

              {orderData.passengers.length > 0 && (
                <OrderDetails
                  tourTitle={orderData.tourTitle}
                  date={orderData.date}
                  timeSlot={orderData.timeSlot}
                  adults={orderData.adults}
                  numChildren={orderData.children}
                  passengers={orderData.passengers}
                />
              )}
            </>
          )}

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
          </div>
        </div>
      </main>
    </>
  );
}

