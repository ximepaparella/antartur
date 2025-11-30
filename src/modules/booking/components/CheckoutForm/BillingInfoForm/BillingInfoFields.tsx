"use client";

import React from "react";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import type { BillingInfo } from "@/lib/types/order";
import { PROVINCE_OPTIONS } from "../constants/provinceOptions";
import { COUNTRY_OPTIONS } from "../constants/countryOptions";
import styles from "../CheckoutForm.module.scss";

interface BillingInfoFieldsProps {
  billingInfo: BillingInfo;
  errors: Record<string, string>;
  onBillingInfoChange: (updates: Partial<BillingInfo>) => void;
  onValidateField: (field: keyof BillingInfo, value: string) => void;
}

/**
 * Componente BillingInfoFields para los campos de información de facturación
 */
export const BillingInfoFields: React.FC<BillingInfoFieldsProps> = ({
  billingInfo,
  errors,
  onBillingInfoChange,
  onValidateField,
}) => {
  return (
    <>
      {/* Personal info */}
      <div className={styles.formRow}>
        <Input
          label="Nombre"
          name="billing-nombre"
          required
          value={billingInfo.nombreCompleto}
          onChange={(e) => onBillingInfoChange({ nombreCompleto: e.target.value })}
          onBlur={(e) => onValidateField("nombreCompleto", e.target.value)}
          error={errors["billing.nombreCompleto"]}
          className={styles.formGroup}
        />
        <Input
          label="Apellidos"
          name="billing-apellidos"
          required
          value={billingInfo.apellidos}
          onChange={(e) => onBillingInfoChange({ apellidos: e.target.value })}
          onBlur={(e) => onValidateField("apellidos", e.target.value)}
          error={errors["billing.apellidos"]}
          className={styles.formGroup}
        />
      </div>

      <div className={styles.formRow}>
        <Input
          label="Correo electrónico"
          name="billing-email"
          type="email"
          required
          value={billingInfo.email}
          onChange={(e) => onBillingInfoChange({ email: e.target.value })}
          onBlur={(e) => onValidateField("email", e.target.value)}
          error={errors["billing.email"]}
          className={styles.formGroup}
        />
        <Input
          label="Teléfono"
          name="billing-telefono"
          type="tel"
          required
          value={billingInfo.telefono}
          onChange={(e) => onBillingInfoChange({ telefono: e.target.value })}
          onBlur={(e) => onValidateField("telefono", e.target.value)}
          error={errors["billing.telefono"]}
          className={styles.formGroup}
        />
      </div>

      {/* Address */}
      <div className={styles.formRow}>
        <Input
          label="Dirección de la calle"
          name="billing-direccion"
          required
          value={billingInfo.direccion}
          onChange={(e) => onBillingInfoChange({ direccion: e.target.value })}
          onBlur={(e) => onValidateField("direccion", e.target.value)}
          error={errors["billing.direccion"]}
          className={styles.formGroup}
        />
      </div>

      <div className={styles.formRow}>
        <Input
          label="Localidad / Ciudad"
          name="billing-ciudad"
          required
          value={billingInfo.ciudad}
          onChange={(e) => onBillingInfoChange({ ciudad: e.target.value })}
          onBlur={(e) => onValidateField("ciudad", e.target.value)}
          error={errors["billing.ciudad"]}
          className={styles.formGroup}
        />
        <Select
          label="Región / Provincia / Departamento"
          name="billing-provincia"
          required
          options={PROVINCE_OPTIONS}
          value={billingInfo.provincia}
          onChange={(e) => {
            onBillingInfoChange({ provincia: e.target.value });
            onValidateField("provincia", e.target.value);
          }}
          onBlur={(e) => onValidateField("provincia", e.target.value)}
          error={errors["billing.provincia"]}
          className={styles.formGroup}
        />
      </div>

      <div className={styles.formRow}>
        <Input
          label="Código postal"
          name="billing-codigoPostal"
          required
          value={billingInfo.codigoPostal}
          onChange={(e) => onBillingInfoChange({ codigoPostal: e.target.value })}
          onBlur={(e) => onValidateField("codigoPostal", e.target.value)}
          error={errors["billing.codigoPostal"]}
          className={styles.formGroup}
        />
        <Select
          label="País / Región"
          name="billing-pais"
          required
          options={COUNTRY_OPTIONS}
          value={billingInfo.pais}
          onChange={(e) => {
            onBillingInfoChange({ pais: e.target.value });
            onValidateField("pais", e.target.value);
          }}
          onBlur={(e) => onValidateField("pais", e.target.value)}
          error={errors["billing.pais"]}
          className={styles.formGroup}
        />
      </div>

      {/* Document */}
      <div className={styles.formRow}>
        <Input
          label="DNI / CUIT / CUIL"
          name="billing-documento"
          required
          value={billingInfo.documento}
          onChange={(e) => onBillingInfoChange({ documento: e.target.value })}
          onBlur={(e) => onValidateField("documento", e.target.value)}
          error={errors["billing.documento"]}
          className={styles.formGroup}
        />
      </div>
    </>
  );
};

