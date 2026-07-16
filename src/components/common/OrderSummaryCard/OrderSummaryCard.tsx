"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import { Message } from "@/components/common/Message";
import type { CompletedOrderData } from "@/lib/utils/orderStorage";
import styles from "./OrderSummaryCard.module.scss";

interface OrderSummaryCardProps {
  orderData: CompletedOrderData;
  showTotal?: boolean;
  showMessage?: boolean;
  messageVariant?: "info" | "success";
  customMessage?: string;
}

/**
 * Componente reutilizable para mostrar el resumen de una orden
 * Incluye código de orden, total (opcional) y mensaje (opcional)
 */
export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  orderData,
  showTotal = true,
  showMessage = false,
  messageVariant = "success",
  customMessage,
}) => {
  const formatPrice = (amount: number, currency: string) => {
    const symbol = currency === "USD" ? "$" : "$";
    return `${symbol} ${amount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isEnquiry = orderData.type === "ENQUIRY";

  // Mensaje por defecto según el tipo de orden / método de pago.
  // Solo reservas pagadas online se muestran como confirmadas.
  const defaultMessage = isEnquiry
    ? `Hemos recibido tu consulta. Nuestro equipo se contactará contigo a la brevedad al correo ${orderData.customerEmail}.`
    : orderData.paymentMethod === "transferencia"
    ? `Tu reserva está pendiente de confirmación. Hemos enviado los detalles a ${orderData.customerEmail}.`
    : `Tu reserva ha sido confirmada. Hemos enviado los detalles a ${orderData.customerEmail}.`;

  const message = customMessage || defaultMessage;

  return (
    <Card className={styles.orderCard}>
      <div className={styles.orderInfo}>
        <div className={styles.orderCode}>
          <strong>Código de orden:</strong> {orderData.code}
        </div>

        {showTotal && !isEnquiry && orderData.totalAmount > 0 && (
          <div className={styles.orderTotal}>
            <strong>Total:</strong> {formatPrice(orderData.totalAmount, orderData.currency)}
          </div>
        )}

        {showTotal && isEnquiry && orderData.totalAmount > 0 && (
          <div className={styles.orderTotal}>
            <strong>Total estimado:</strong> {formatPrice(orderData.totalAmount, orderData.currency)}
          </div>
        )}

        {showMessage && (
          <div className={styles.orderMessage}>
            <Message variant={messageVariant}>
              <p>
                {message.split(orderData.customerEmail).map((part, index, array) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < array.length - 1 && <strong>{orderData.customerEmail}</strong>}
                  </React.Fragment>
                ))}
              </p>
            </Message>
          </div>
        )}
      </div>
    </Card>
  );
};

