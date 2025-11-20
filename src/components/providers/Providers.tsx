"use client";

/**
 * Wrapper de providers para la aplicación
 * Agrupa todos los context providers necesarios
 */

import { CurrencyProvider } from "@/contexts/CurrencyContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}

