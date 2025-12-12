"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PaymentGatewayCard, PaymentGatewayData, PendingGatewayCard, PendingGatewayData } from "@/modules/admin/components/PaymentGatewayCard";
import { Message } from "@/components/common/Message";
import styles from "./page.module.scss";

// Gateways pendientes de integración
const PENDING_GATEWAYS: PendingGatewayData[] = [
  {
    id: "mercadopago",
    displayName: "Mercado Pago",
    description: "Plataforma de pagos líder en Latinoamérica. Acepta tarjetas, transferencias y pagos en efectivo.",
    currency: "ARS",
    icon: "credit-card",
  },
  {
    id: "modo",
    displayName: "Modo",
    description: "Billetera digital argentina que permite pagos con QR y transferencias bancarias.",
    currency: "ARS",
    icon: "wallet",
  },
  {
    id: "pix",
    displayName: "Pix",
    description: "Sistema de pagos instantáneos de Brasil. Ideal para clientes brasileños.",
    currency: "BRL",
    icon: "credit-card",
  },
];

export default function PaymentSettingsPage() {
  const [gateways, setGateways] = useState<PaymentGatewayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchGateways = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings/payments");
      const data = await response.json();

      if (data.success) {
        setGateways(data.data);
      } else {
        setError(data.error?.detail || "Error al cargar los gateways de pago");
      }
    } catch (err) {
      setError("Error de conexión al cargar los gateways");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const handleToggleActive = async (provider: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/settings/payments/${provider}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (data.success) {
        setGateways((prev) =>
          prev.map((g) => (g.provider === provider ? { ...g, ...data.data } : g))
        );
        setSuccessMessage(
          `${provider} ${isActive ? "activado" : "desactivado"} correctamente`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error?.detail || "Error al actualizar el gateway");
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError("Error de conexión al actualizar el gateway");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleToggleSandbox = async (provider: string, isSandbox: boolean) => {
    try {
      const response = await fetch(`/api/admin/settings/payments/${provider}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSandbox }),
      });

      const data = await response.json();

      if (data.success) {
        setGateways((prev) =>
          prev.map((g) => (g.provider === provider ? { ...g, ...data.data } : g))
        );
        setSuccessMessage(
          `${provider} cambiado a modo ${isSandbox ? "Sandbox" : "Producción"}`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error?.detail || "Error al cambiar el modo");
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError("Error de conexión al cambiar el modo");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleTestConnection = async (provider: string) => {
    const response = await fetch(`/api/admin/settings/payments/${provider}/test`, {
      method: "POST",
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error?.detail || "Error al probar la conexión");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Cargando configuración de pagos...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Medios de Pago</h1>
        <p className={styles.subtitle}>
          Configura y administra los gateways de pago disponibles para tus clientes
        </p>
      </div>

      {error && (
        <div className={styles.messageWrapper}>
          <Message variant="alert">
            {error}
          </Message>
          <button 
            className={styles.dismissButton} 
            onClick={() => setError(null)}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className={styles.messageWrapper}>
          <Message variant="success">
            {successMessage}
          </Message>
          <button 
            className={styles.dismissButton} 
            onClick={() => setSuccessMessage(null)}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.infoBox}>
        <h3 className={styles.infoTitle}>Configuración de credenciales</h3>
        <p className={styles.infoText}>
          Las credenciales de los gateways (API Keys, Client IDs, Secrets) deben configurarse
          en las variables de entorno del servidor por seguridad. Desde aquí solo puedes
          activar/desactivar los gateways y cambiar entre modo Sandbox y Producción.
        </p>
        <div className={styles.envVars}>
          <div className={styles.envGroup}>
            <strong>PayPal:</strong>
            <code>PAYPAL_CLIENT_ID</code>
            <code>PAYPAL_CLIENT_SECRET</code>
          </div>
          <div className={styles.envGroup}>
            <strong>Payway:</strong>
            <code>PAYWAY_API_KEY</code>
            <code>PAYWAY_MERCHANT_ID</code>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Gateways Activos</h2>
      <div className={styles.gatewaysGrid}>
        {gateways.map((gateway) => (
          <PaymentGatewayCard
            key={gateway.id}
            gateway={gateway}
            onToggleActive={handleToggleActive}
            onToggleSandbox={handleToggleSandbox}
            onTestConnection={handleTestConnection}
          />
        ))}
      </div>

      {gateways.length === 0 && !isLoading && (
        <div className={styles.emptyState}>
          <p>No hay gateways de pago configurados.</p>
          <p>Ejecuta el seed de la base de datos para crear los gateways iniciales.</p>
        </div>
      )}

      <h2 className={styles.sectionTitle}>Próximamente</h2>
      <div className={styles.gatewaysGrid}>
        {PENDING_GATEWAYS.map((gateway) => (
          <PendingGatewayCard key={gateway.id} gateway={gateway} />
        ))}
      </div>
    </div>
  );
}
