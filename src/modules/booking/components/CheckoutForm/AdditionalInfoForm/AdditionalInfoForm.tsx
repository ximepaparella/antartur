"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import type { BillingInfo } from "@/lib/types/order";
import styles from "../CheckoutForm.module.scss";

interface AdditionalInfoFormProps {
  billingInfo: BillingInfo;
  onBillingInfoChange: (updates: Partial<BillingInfo>) => void;
}

/**
 * Componente AdditionalInfoForm para la sección de información adicional
 */
export const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({
  billingInfo,
  onBillingInfoChange,
}) => {
  return (
    <Card title="Información adicional" className={styles.section}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Notas del pedido (opcional)
          </label>
          <textarea
            name="notas-pedido"
            className={styles.textarea}
            value={billingInfo.notasPedido || ""}
            onChange={(e) => onBillingInfoChange({ notasPedido: e.target.value })}
            placeholder="Notas sobre tu pedido, por ejemplo, notas especiales para la entrega."
            rows={5}
          />
        </div>
      </div>
    </Card>
  );
};

