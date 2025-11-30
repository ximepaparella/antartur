"use client";

/**
 * Context para manejar la moneda seleccionada globalmente
 * Por defecto muestra ARS, pero permite cambiar a USD u otras monedas
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Currency = "ARS" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = "antartur_selected_currency";
const DEFAULT_CURRENCY: Currency = "ARS";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);

  // Cargar moneda desde localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored === "ARS" || stored === "USD") {
        setCurrencyState(stored);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambia
  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    }
  }, []);

  // Formatear precio según la moneda seleccionada
  const formatPrice = useCallback(
    (amount: number): string => {
      const formattedAmount = amount.toLocaleString("es-AR", { maximumFractionDigits: 0 });
      
      switch (currency) {
        case "USD":
          return `USD ${formattedAmount}`;
        case "ARS":
        default:
          return `$${formattedAmount}`;
      }
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook para usar el contexto de moneda
 */
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

