"use client";

/**
 * Componente para cambiar entre monedas (ARS/USD)
 */

import React from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import styles from "./CurrencySwitcher.module.scss";

export const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className={styles.switcher}>
      <button
        type="button"
        className={`${styles.button} ${currency === "ARS" ? styles.active : ""}`}
        onClick={() => setCurrency("ARS")}
        aria-pressed={currency === "ARS"}
        aria-label="Mostrar precios en Pesos Argentinos"
      >
        ARS
      </button>
      <button
        type="button"
        className={`${styles.button} ${currency === "USD" ? styles.active : ""}`}
        onClick={() => setCurrency("USD")}
        aria-pressed={currency === "USD"}
        aria-label="Mostrar precios en Dólares"
      >
        USD
      </button>
    </div>
  );
};
