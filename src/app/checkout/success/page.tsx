"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Button } from "@/components/common/Button/Button";
import { Icon } from "@/components/icons/Icon";
import { OrderDetails } from "@/components/common/OrderDetails";
import { OrderSummaryCard } from "@/components/common/OrderSummaryCard";
import { PaymentDetails } from "@/components/common/PaymentDetails";
import { getCompletedOrderData, type CompletedOrderData } from "@/lib/utils/orderStorage";
import { generateOrderWhatsAppLink } from "@/lib/utils/whatsapp";
import type { OrderFullResponse } from "@/modules/orders/api/dto/ordersDto";
import styles from "./page.module.scss";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<CompletedOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        // Intentar obtener código de orden desde URL params o sessionStorage
        const orderCodeFromUrl = searchParams.get("code");
        const completedDataFromStorage = getCompletedOrderData();
        const orderCode = orderCodeFromUrl || completedDataFromStorage?.code;

        if (!orderCode) {
      router.push("/");
          return;
    }

        // Obtener datos desde la base de datos
        const response = await fetch(`/api/orders/code/${orderCode}?includePayments=true`);
        
        if (!response.ok) {
          throw new Error("No se pudo cargar la orden");
        }

        const result = await response.json();
        if (!result.success || !result.data) {
          throw new Error("Orden no encontrada");
        }

        const order: OrderFullResponse = result.data;

        // Mapear datos de la BD al formato esperado
        const booking = order.bookings?.[0];
        if (!booking) {
          throw new Error("No se encontraron datos de reserva");
        }

        // Obtener información del tour desde el snapshot o desde tourDeparture
        const tourTitle = booking.tourDeparture?.tour?.name || booking.tourNameSnapshot || "Tour";
        const departureDate = booking.departureDateSnapshot;
        const startTime = booking.startTimeSnapshot;
        
        // Obtener endTime desde tourDeparture si está disponible
        const endTime = booking.tourDeparture?.endTime || startTime;
        
        // Determinar método de pago desde payments, notes o estado
        let paymentMethod: "transferencia" | "paypal" | "payway" | undefined;
        if (order.payments && order.payments.length > 0) {
          const provider = order.payments[0].provider.toUpperCase();
          if (provider === "PAYPAL") {
            paymentMethod = "paypal";
          } else if (provider === "PAYWAY") {
            paymentMethod = "payway";
          }
        } else if (order.notes?.toLowerCase().includes("transferencia")) {
          paymentMethod = "transferencia";
        } else if (order.status === "PENDING_PAYMENT" && order.type === "RESERVATION") {
          // Si está pendiente de pago y es una reserva sin payments, probablemente es transferencia
          paymentMethod = "transferencia";
        }

        // Mapear passengers
        const passengers = booking.passengers.map((p) => {
          const restrictions = p.restrictions as Record<string, unknown> | null;
          return {
            nombreCompleto: `${p.firstName} ${p.lastName}`,
            fechaNacimiento: p.birthDate || undefined,
            documento: p.documentNumber || undefined,
            direccion: undefined, // No disponible en BD
            telefono: p.phone || undefined,
            esAdulto: p.type === "ADULT",
            embarazada: restrictions?.embarazada as boolean | undefined,
            problemasColumnaSalud: restrictions?.problemasColumnaSalud as boolean | undefined,
            restriccionesAlimentarias: restrictions
              ? {
                  vegetariano: restrictions.vegetariano as boolean | undefined,
                  vegano: restrictions.vegano as boolean | undefined,
                  celiaco: restrictions.celiaco as boolean | undefined,
                  alergias: restrictions.alergias as boolean | undefined,
                  alergiasDetalle: restrictions.alergiasDetalle as string | undefined,
                }
              : undefined,
          };
        });

        const mappedData: CompletedOrderData = {
          code: order.code,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          totalAmount: order.totalAmount,
          currency: order.currency,
          type: order.type as "RESERVATION" | "ENQUIRY",
          paymentMethod,
          tourTitle,
          date: departureDate,
          timeSlot: {
            start: startTime,
            end: endTime,
          },
          adults: booking.numAdults,
          children: booking.numChildren,
          passengers,
        };

        setOrderData(mappedData);
      } catch (err) {
        console.error("Error al cargar datos de la orden:", err);
        setError(err instanceof Error ? err.message : "Error al cargar la orden");
        
        // Intentar usar datos de sessionStorage como fallback
        const completedDataFromStorage = getCompletedOrderData();
        if (completedDataFromStorage) {
          setOrderData(completedDataFromStorage);
          setError(null);
        } else {
          // Si no hay datos en ningún lado, redirigir al inicio después de un delay
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      } finally {
    setIsLoading(false);
      }
    };

    loadOrderData();
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Cargando datos de la orden...</p>
      </div>
    );
  }

  if (error && !orderData) {
    return (
      <div className={styles.loading}>
        <p>{error}</p>
        <p>Redirigiendo al inicio...</p>
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

