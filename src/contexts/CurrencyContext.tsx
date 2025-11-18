"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "ARS" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  isHydrated: boolean; // Indica si ya se hidrató desde localStorage
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = "antartur_currency";

// Función helper para leer la moneda desde localStorage de forma segura (solo en cliente)
function getStoredCurrency(): Currency {
  if (typeof window === "undefined") {
    return "ARS"; // Default para SSR
  }
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored === "ARS" || stored === "USD") {
      return stored;
    }
  } catch (error) {
    console.error("[CurrencyContext] Error reading from localStorage:", error);
  }
  return "ARS";
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // CRÍTICO: Siempre inicializar con "ARS" para evitar hydration mismatch
  // El servidor siempre renderiza con "ARS", y el cliente también debe empezar con "ARS"
  // Luego actualizamos desde localStorage en useEffect (después de hydration)
  const [currency, setCurrencyState] = useState<Currency>("ARS");
  const [isHydrated, setIsHydrated] = useState(false);

  // Leer desde localStorage SOLO después de que el componente se monte (post-hydration)
  useEffect(() => {
    const stored = getStoredCurrency();
    setCurrencyState(stored);
    setIsHydrated(true);
    console.log("[CurrencyContext] Currency loaded from localStorage:", stored);
  }, []); // Solo ejecutar una vez al montar

  const setCurrency = (newCurrency: Currency) => {
    console.log("[CurrencyContext] setCurrency called with:", newCurrency);
    console.log("[CurrencyContext] Previous currency:", currency);
    setCurrencyState(newCurrency);
    
    // Guardar en localStorage solo si estamos en cliente
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
        // Disparar evento personalizado para re-hidratar componentes
        window.dispatchEvent(new CustomEvent("currencyChanged", { detail: newCurrency }));
        console.log("[CurrencyContext] Currency changed to:", newCurrency);
      } catch (error) {
        console.error("[CurrencyContext] Error saving to localStorage:", error);
      }
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isHydrated }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

