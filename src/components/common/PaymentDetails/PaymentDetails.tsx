"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import { Icon } from "@/components/icons/Icon";
import styles from "./PaymentDetails.module.scss";

type PaymentMethod = "transferencia" | "paypal" | "payway";

interface PaymentDetailsProps {
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  currency: string;
  orderCode: string;
}

/**
 * Componente para mostrar los detalles del pago de una reserva
 */
export const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  paymentMethod,
  totalAmount,
  currency,
  orderCode,
}) => {
  const formatPrice = (amount: number, currency: string) => {
    const symbol = currency === "USD" ? "$" : "$";
    return `${symbol} ${amount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getPaymentMethodLabel = (method?: PaymentMethod): string => {
    switch (method) {
      case "transferencia":
        return "Transferencia Bancaria";
      case "paypal":
        return "PayPal";
      case "payway":
        return "Payway";
      default:
        return "Pendiente de definir";
    }
  };

  const getPaymentMethodIcon = (method?: PaymentMethod): string => {
    switch (method) {
      case "transferencia":
        return "bank";
      case "paypal":
        return "credit-card";
      case "payway":
        return "credit-card";
      default:
        return "wallet";
    }
  };

  return (
    <Card className={styles.paymentDetailsCard}>
      <h3 className={styles.title}>Detalles del Pago</h3>
      
      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Método de pago:</span>
          <span className={styles.value}>
            <Icon name={getPaymentMethodIcon(paymentMethod) as any} size={18} className={styles.icon} />
            {getPaymentMethodLabel(paymentMethod)}
          </span>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.label}>Total pagado:</span>
          <span className={`${styles.value} ${styles.totalAmount}`}>
            {formatPrice(totalAmount, currency)}
          </span>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.label}>Código de orden:</span>
          <span className={styles.value}>{orderCode}</span>
        </div>
        
        {paymentMethod === "transferencia" && (
          <div className={styles.transferNote}>
            <Icon name="info" size={16} className={styles.infoIcon} />
            <p>
              Recibirás las instrucciones de transferencia por correo electrónico.
              La reserva estará vigente por 24 horas desde la confirmación.
            </p>
          </div>
        )}
        
        {(paymentMethod === "paypal" || paymentMethod === "payway") && (
          <div className={styles.onlinePaymentNote}>
            <Icon name="check-circle" size={16} className={styles.successIcon} />
            <p>
              El pago ha sido procesado exitosamente. Recibirás el comprobante por correo electrónico.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

