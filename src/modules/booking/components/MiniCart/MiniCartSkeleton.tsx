"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import styles from "./MiniCart.module.scss";

/**
 * Skeleton loader para MiniCart mientras se recarga la información
 */
export const MiniCartSkeleton: React.FC = () => {
  return (
    <div className={styles.miniCart}>
      <Card title="Tu pedido">
        <div className={styles.orderSummary}>
          <div className={styles.skeletonTourInfo}>
            <div className={styles.skeletonLine} style={{ width: "60%", height: "20px", marginBottom: "8px" }} />
            <div className={styles.skeletonLine} style={{ width: "40%", height: "16px" }} />
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.skeletonLine} style={{ width: "40%", height: "16px" }} />
            <div className={styles.skeletonLine} style={{ width: "30%", height: "16px" }} />
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.skeletonLine} style={{ width: "40%", height: "16px" }} />
            <div className={styles.skeletonLine} style={{ width: "30%", height: "16px" }} />
          </div>

          <div className={styles.divider} />

          <div className={styles.summaryRow}>
            <div className={styles.skeletonLine} style={{ width: "40%", height: "16px" }} />
            <div className={styles.skeletonLine} style={{ width: "30%", height: "16px" }} />
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.skeletonLine} style={{ width: "40%", height: "20px" }} />
            <div className={styles.skeletonLine} style={{ width: "30%", height: "20px" }} />
          </div>
        </div>
      </Card>

      <Card title="Método de pago">
        <div className={styles.skeletonPaymentOptions}>
          <div className={styles.skeletonPaymentOption} />
          <div className={styles.skeletonPaymentOption} />
          <div className={styles.skeletonPaymentOption} />
        </div>
      </Card>

      <div className={styles.skeletonButton} />
    </div>
  );
};

