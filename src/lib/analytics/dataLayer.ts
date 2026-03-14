"use client";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Envía un evento al dataLayer de Google Tag Manager.
 * No lanza errores si GTM todavía no está inicializado.
 */
export function pushToDataLayer(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  if (!Array.isArray(window.dataLayer)) {
    window.dataLayer = [];
  }

  window.dataLayer.push(event);
}

