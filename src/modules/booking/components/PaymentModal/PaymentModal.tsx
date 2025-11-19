"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal";
import { formatPrice } from "@/lib/utils/priceFormat";
import { calculateOrderTotal } from "@/lib/utils/pricing";
import type { Order, PaymentMethod } from "@/lib/types/order";
import styles from "./PaymentModal.module.scss";

interface PaymentModalProps {
  /** Orden completada */
  order: Order;
  /** Método de pago seleccionado */
  paymentMethod: PaymentMethod;
  /** Callback cuando se cierra el modal */
  onClose: () => void;
  /** Callback cuando se completa el pago */
  onPaymentComplete: () => void;
}

/**
 * Modal dummy de pasarela de pagos
 */
export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  paymentMethod,
  onClose,
  onPaymentComplete,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const total = calculateOrderTotal(order.adults, order.children, order.pricing);

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case "transferencia":
        return "Transferencia bancaria directa";
      case "paypal":
        return "PayPal";
      case "payway":
        return "Payway Payment";
      default:
        return method;
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  return (
    <Modal
      isOpen={true}
      isClosing={isClosing}
      title="Procesar Pago"
      size="small"
      onClose={handleClose}
    >
      <div className={styles.orderInfo}>
        <p className={styles.orderNumber}>Orden: {order.orderId}</p>
        <p className={styles.orderTotal}>Total: {formatPrice(total)}</p>
        <p className={styles.paymentMethod}>Método: {getPaymentMethodLabel(paymentMethod)}</p>
      </div>

      <div className={styles.paymentNote}>
        <Icon name="info" size={20} />
        <p>
          Esta es una simulación de pago. En producción, aquí se integraría con la pasarela de pagos correspondiente.
        </p>
      </div>

      <div className={styles.modalActions}>
        <Button
          variant="primary"
          onClick={onPaymentComplete}
        >
          Confirmar Pago
        </Button>
        <Button
          variant="outline"
          onClick={handleClose}
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
};

