"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import type { BillingInfo } from "@/lib/types/order";
import { BillingInfoFields } from "./BillingInfoFields";
import styles from "../CheckoutForm.module.scss";

interface BillingInfoFormProps {
  billingInfo: BillingInfo;
  errors: Record<string, string>;
  onBillingInfoChange: (updates: Partial<BillingInfo>) => void;
  onValidateField: (field: keyof BillingInfo, value: string) => void;
}

/**
 * Componente BillingInfoForm para la sección de información de facturación
 */
export const BillingInfoForm: React.FC<BillingInfoFormProps> = ({
  billingInfo,
  errors,
  onBillingInfoChange,
  onValidateField,
}) => {
  return (
    <Card title="Detalles de facturación" className={styles.section}>
      <BillingInfoFields
        billingInfo={billingInfo}
        errors={errors}
        onBillingInfoChange={onBillingInfoChange}
        onValidateField={onValidateField}
      />
    </Card>
  );
};

