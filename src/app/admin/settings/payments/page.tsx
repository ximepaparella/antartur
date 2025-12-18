"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  PaymentGatewayCard, 
  PaymentGatewayData, 
  PendingGatewayCard, 
  PendingGatewayData,
  BankTransferCard,
  BankTransferData as BankTransferDataType
} from "@/modules/admin/components/PaymentGatewayCard";
import { Message } from "@/components/common/Message";
import { createAuthHeaders } from "@/modules/admin/lib/authHelpers";
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
  const [bankTransfer, setBankTransfer] = useState<BankTransferDataType | null>(null);
  const [isLoadingBankTransfer, setIsLoadingBankTransfer] = useState(true);

  const fetchGateways = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings/payments", {
        headers: createAuthHeaders({ "Content-Type": "application/json" }),
      });
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

  const fetchBankTransfer = useCallback(async () => {
    setIsLoadingBankTransfer(true);
    try {
      const headers = createAuthHeaders({ "Content-Type": "application/json" });
      
      const response = await fetch("/api/admin/settings/bank-transfer", {
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Bank transfer API error:", response.status, errorText);
        // Si es 401, probablemente el token expiró, no crear datos por defecto
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setBankTransfer(data.data);
      } else {
        console.error("Error en respuesta de bank-transfer:", data.error);
        // Crear datos por defecto para que el componente se muestre
        setBankTransfer({
          id: "default",
          isActive: false,
          accountName: "",
          accountNumber: "",
          bank: "",
          cuit: "",
          cbu: "",
          alias: "",
          updatedAt: new Date().toISOString(),
        });
        setError(data.error?.detail || "Error al cargar la configuración de transferencia bancaria");
      }
    } catch (err) {
      console.error("Error al cargar configuración de transferencia bancaria:", err);
      // Crear un objeto por defecto para que el componente se muestre
      // Esto permite que el usuario pueda configurar la transferencia bancaria incluso si falla el fetch inicial
      setBankTransfer({
        id: "default",
        isActive: false,
        accountName: "",
        accountNumber: "",
        bank: "",
        cuit: "",
        cbu: "",
        alias: "",
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoadingBankTransfer(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
    fetchBankTransfer();
  }, [fetchGateways, fetchBankTransfer]);

  const handleToggleActive = async (provider: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/settings/payments/${provider}`, {
        method: "PATCH",
        headers: createAuthHeaders({ "Content-Type": "application/json" }),
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
        headers: createAuthHeaders({ "Content-Type": "application/json" }),
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
      headers: createAuthHeaders({ "Content-Type": "application/json" }),
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error?.detail || "Error al probar la conexión");
    }
  };

  const handleToggleBankTransfer = async (isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/settings/bank-transfer", {
        method: "PATCH",
        headers: createAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (data.success) {
        setBankTransfer(data.data);
        setSuccessMessage(
          `Transferencia bancaria ${isActive ? "activada" : "desactivada"} correctamente`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error?.detail || "Error al actualizar la transferencia bancaria");
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError("Error de conexión al actualizar la transferencia bancaria");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSaveBankTransfer = async (formData: Partial<BankTransferDataType>) => {
    try {
      const response = await fetch("/api/admin/settings/bank-transfer", {
        method: "PATCH",
        headers: createAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setBankTransfer(data.data);
        setSuccessMessage("Datos bancarios actualizados correctamente");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error?.detail || "Error al actualizar los datos bancarios");
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError("Error de conexión al actualizar los datos bancarios");
      setTimeout(() => setError(null), 5000);
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

      <h2 className={styles.sectionTitle}>Transferencia Bancaria</h2>
      {isLoadingBankTransfer ? (
        <div className={styles.emptyState}>
          <p>Cargando configuración de transferencia bancaria...</p>
        </div>
      ) : bankTransfer ? (
        <div className={styles.gatewaysGrid}>
          <BankTransferCard
            bankTransfer={bankTransfer}
            onToggleActive={handleToggleBankTransfer}
            onSave={handleSaveBankTransfer}
          />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No se pudo cargar la configuración de transferencia bancaria.</p>
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
