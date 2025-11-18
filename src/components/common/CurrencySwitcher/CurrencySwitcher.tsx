"use client";

import React from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import styles from "./CurrencySwitcher.module.scss";

export const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  const handleCurrencyChange = (newCurrency: "ARS" | "USD") => {
    console.log("[CurrencySwitcher] User clicked:", newCurrency);
    console.log("[CurrencySwitcher] Current currency:", currency);
    setCurrency(newCurrency);
  };

  return (
    <div className={styles.currencySwitcher}>
      <button
        className={`${styles.currencyButton} ${currency === "ARS" ? styles.active : ""}`}
        onClick={() => handleCurrencyChange("ARS")}
        aria-label="Cambiar a pesos argentinos"
        aria-pressed={currency === "ARS"}
      >
        ARS
      </button>
      <span className={styles.separator}>/</span>
      <button
        className={`${styles.currencyButton} ${currency === "USD" ? styles.active : ""}`}
        onClick={() => handleCurrencyChange("USD")}
        aria-label="Cambiar a dólares estadounidenses"
        aria-pressed={currency === "USD"}
      >
        USD
      </button>
    </div>
  );
};

