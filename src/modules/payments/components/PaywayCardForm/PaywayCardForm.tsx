"use client";

import React, { useState, useCallback, useRef } from "react";
import { usePaywaySDK } from "../../hooks/usePaywaySDK";
import { Button } from "@/components/common/Button/Button";
import { Message } from "@/components/common/Message";
import styles from "./PaywayCardForm.module.scss";

interface PaywayCardFormProps {
  onTokenCreated: (data: { token: string; bin: string; lastFourDigits: string }) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

interface CardFormData {
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  cardHolderName: string;
}

interface FormErrors {
  cardNumber?: string;
  expirationMonth?: string;
  expirationYear?: string;
  securityCode?: string;
  cardHolderName?: string;
}

function validateLuhn(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  let sum = 0;
  let isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export const PaywayCardForm: React.FC<PaywayCardFormProps> = ({
  onTokenCreated,
  onCancel,
  disabled = false,
}) => {
  const { isSDKLoaded, isSDKLoading, sdkError, createToken } = usePaywaySDK();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: "",
    expirationMonth: "",
    expirationYear: "",
    securityCode: "",
    cardHolderName: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const cleaned = formData.cardNumber.replace(/\s/g, "");
    if (!cleaned) {
      newErrors.cardNumber = "El número de tarjeta es requerido";
    } else if (cleaned.length < 13 || cleaned.length > 19) {
      newErrors.cardNumber = "El número de tarjeta debe tener entre 13 y 19 dígitos";
    } else if (!validateLuhn(formData.cardNumber)) {
      newErrors.cardNumber = "El número de tarjeta no es válido";
    }

    const month = parseInt(formData.expirationMonth, 10);
    if (!formData.expirationMonth) {
      newErrors.expirationMonth = "El mes es requerido";
    } else if (month < 1 || month > 12) {
      newErrors.expirationMonth = "El mes debe estar entre 01 y 12";
    }

    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.expirationYear, 10);
    if (!formData.expirationYear) {
      newErrors.expirationYear = "El año es requerido";
    } else if (year < currentYear || year > currentYear + 20) {
      newErrors.expirationYear = "El año no es válido";
    } else if (year === currentYear && month < new Date().getMonth() + 1) {
      newErrors.expirationMonth = "La tarjeta está vencida";
    }

    if (!formData.securityCode) {
      newErrors.securityCode = "El código de seguridad es requerido";
    } else if (formData.securityCode.length < 3 || formData.securityCode.length > 4) {
      newErrors.securityCode = "El código de seguridad debe tener 3 o 4 dígitos";
    } else if (!/^\d+$/.test(formData.securityCode)) {
      newErrors.securityCode = "El código de seguridad solo puede contener números";
    }

    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = "El nombre del titular es requerido";
    } else if (formData.cardHolderName.trim().length < 3) {
      newErrors.cardHolderName = "El nombre debe tener al menos 3 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const formatCardNumber = useCallback((value: string): string => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") ?? cleaned;
    return formatted.slice(0, 23);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!validateForm()) return;
      if (!isSDKLoaded) {
        setError("El SDK de Payway no está cargado. Por favor, recargue la página.");
        return;
      }
      if (!formRef.current) {
        setError("Error al obtener el formulario. Por favor, intente de nuevo.");
        return;
      }

      setIsProcessing(true);
      try {
        const tokenData = await createToken(
          {
            cardNumber: formData.cardNumber,
            expirationMonth: formData.expirationMonth,
            expirationYear: formData.expirationYear,
            securityCode: formData.securityCode,
            cardHolderName: formData.cardHolderName,
          },
          formRef.current
        );
        onTokenCreated(tokenData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al procesar la tarjeta. Por favor, intente nuevamente.");
      } finally {
        setIsProcessing(false);
      }
    },
    [formData, validateForm, isSDKLoaded, createToken, onTokenCreated]
  );

  if (sdkError) {
    return (
      <div className={styles.errorContainer}>
        <Message variant="alert">{sdkError}</Message>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className={styles.cancelButton}>
            Cancelar
          </Button>
        )}
      </div>
    );
  }

  if (isSDKLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Cargando formulario de pago...</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.cardForm} id="payway-card-form">
      {error && (
        <div className={styles.errorMessage}>
          <Message variant="alert">{error}</Message>
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="cardNumber" className={styles.label}>
          Número de Tarjeta
        </label>
        <input
          type="text"
          id="cardNumber"
          name="card_number"
          value={formData.cardNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setFormData((prev) => ({ ...prev, cardNumber: formatCardNumber(value) }));
            if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: undefined }));
          }}
          placeholder="1234 5678 9012 3456"
          maxLength={23}
          className={errors.cardNumber ? styles.inputError : styles.input}
          disabled={disabled || isProcessing}
          autoComplete="cc-number"
        />
        {errors.cardNumber && <span className={styles.errorText}>{errors.cardNumber}</span>}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="expirationMonth" className={styles.label}>
            Mes
          </label>
          <input
            type="text"
            id="expirationMonth"
            name="card_expiration_month"
            value={formData.expirationMonth}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 2);
              setFormData((prev) => ({ ...prev, expirationMonth: value }));
              if (errors.expirationMonth) setErrors((prev) => ({ ...prev, expirationMonth: undefined }));
            }}
            placeholder="MM"
            maxLength={2}
            className={errors.expirationMonth ? styles.inputError : styles.input}
            disabled={disabled || isProcessing}
            autoComplete="cc-exp-month"
          />
          {errors.expirationMonth && <span className={styles.errorText}>{errors.expirationMonth}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="expirationYear" className={styles.label}>
            Año
          </label>
          <input
            type="text"
            id="expirationYear"
            name="card_expiration_year"
            value={formData.expirationYear}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
              setFormData((prev) => ({ ...prev, expirationYear: value }));
              if (errors.expirationYear) setErrors((prev) => ({ ...prev, expirationYear: undefined }));
            }}
            placeholder="YYYY"
            maxLength={4}
            className={errors.expirationYear ? styles.inputError : styles.input}
            disabled={disabled || isProcessing}
            autoComplete="cc-exp-year"
          />
          {errors.expirationYear && <span className={styles.errorText}>{errors.expirationYear}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="securityCode" className={styles.label}>
            CVV
          </label>
          <input
            type="text"
            id="securityCode"
            name="security_code"
            value={formData.securityCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
              setFormData((prev) => ({ ...prev, securityCode: value }));
              if (errors.securityCode) setErrors((prev) => ({ ...prev, securityCode: undefined }));
            }}
            placeholder="123"
            maxLength={4}
            className={errors.securityCode ? styles.inputError : styles.input}
            disabled={disabled || isProcessing}
            autoComplete="cc-csc"
          />
          {errors.securityCode && <span className={styles.errorText}>{errors.securityCode}</span>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cardHolderName" className={styles.label}>
          Nombre del Titular
        </label>
        <input
          type="text"
          id="cardHolderName"
          name="card_holder_name"
          value={formData.cardHolderName}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, cardHolderName: e.target.value }));
            if (errors.cardHolderName) setErrors((prev) => ({ ...prev, cardHolderName: undefined }));
          }}
          placeholder="Como aparece en la tarjeta"
          className={errors.cardHolderName ? styles.inputError : styles.input}
          disabled={disabled || isProcessing}
          autoComplete="cc-name"
        />
        {errors.cardHolderName && <span className={styles.errorText}>{errors.cardHolderName}</span>}
      </div>

      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || isProcessing || !isSDKLoaded}
          className={styles.submitButton}
        >
          {isProcessing ? "Procesando..." : "Continuar con el Pago"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={disabled || isProcessing}
            className={styles.cancelButton}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};
