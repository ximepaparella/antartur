"use client";

import React from "react";
import { Icon } from "@/components/icons/Icon";
import styles from "./PendingGatewayCard.module.scss";

export interface PendingGatewayData {
  id: string;
  displayName: string;
  description: string;
  currency: string;
  icon: string;
}

interface PendingGatewayCardProps {
  gateway: PendingGatewayData;
}

export const PendingGatewayCard: React.FC<PendingGatewayCardProps> = ({
  gateway,
}) => {
  const getCurrencyLabel = (currency: string): string => {
    switch (currency) {
      case "USD":
        return "Dólares (USD)";
      case "ARS":
        return "Pesos Argentinos (ARS)";
      case "BRL":
        return "Reales (BRL)";
      case "MULTI":
        return "Múltiples monedas";
      default:
        return currency;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.providerInfo}>
          <div className={styles.iconWrapper}>
            <Icon name={gateway.icon as any} size={24} />
          </div>
          <div className={styles.providerDetails}>
            <h3 className={styles.providerName}>{gateway.displayName}</h3>
            <span className={styles.currency}>{getCurrencyLabel(gateway.currency)}</span>
          </div>
        </div>
        <div className={styles.pendingBadge}>
          Pendiente de integración
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.description}>{gateway.description}</p>
      </div>
    </div>
  );
};
