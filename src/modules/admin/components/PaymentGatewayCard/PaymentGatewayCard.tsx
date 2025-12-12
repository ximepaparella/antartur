"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import styles from "./PaymentGatewayCard.module.scss";

export interface PaymentGatewayData {
  id: string;
  provider: string;
  displayName: string;
  isActive: boolean;
  isSandbox: boolean;
  currency: string;
  hasCredentials: boolean;
  updatedAt: string;
}

interface PaymentGatewayCardProps {
  gateway: PaymentGatewayData;
  onToggleActive: (provider: string, isActive: boolean) => Promise<void>;
  onToggleSandbox: (provider: string, isSandbox: boolean) => Promise<void>;
  onTestConnection: (provider: string) => Promise<{ connected: boolean; message: string; environment: string }>;
}

export const PaymentGatewayCard: React.FC<PaymentGatewayCardProps> = ({
  gateway,
  onToggleActive,
  onToggleSandbox,
  onTestConnection,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    message: string;
    environment: string;
  } | null>(null);

  const handleToggleActive = async () => {
    if (!gateway.hasCredentials) {
      alert("No se puede activar el gateway sin credenciales configuradas en las variables de entorno.");
      return;
    }
    setIsUpdating(true);
    try {
      await onToggleActive(gateway.provider, !gateway.isActive);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleSandbox = async () => {
    setIsUpdating(true);
    try {
      await onToggleSandbox(gateway.provider, !gateway.isSandbox);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await onTestConnection(gateway.provider);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        connected: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        environment: gateway.isSandbox ? "sandbox" : "production",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getProviderIcon = (provider: string): string => {
    switch (provider) {
      case "PAYPAL":
        return "credit-card";
      case "PAYWAY":
        return "wallet";
      default:
        return "credit-card";
    }
  };

  const getCurrencyLabel = (currency: string): string => {
    switch (currency) {
      case "USD":
        return "Dólares (USD)";
      case "ARS":
        return "Pesos Argentinos (ARS)";
      default:
        return currency;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.providerInfo}>
          <div className={styles.iconWrapper}>
            <Icon name={getProviderIcon(gateway.provider) as any} size={24} />
          </div>
          <div className={styles.providerDetails}>
            <h3 className={styles.providerName}>{gateway.displayName}</h3>
            <span className={styles.currency}>{getCurrencyLabel(gateway.currency)}</span>
          </div>
        </div>
        <div className={styles.statusBadge}>
          {gateway.isActive ? (
            <span className={styles.activeBadge}>Activo</span>
          ) : (
            <span className={styles.inactiveBadge}>Inactivo</span>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {/* Credenciales */}
        <div className={styles.credentialsStatus}>
          {gateway.hasCredentials ? (
            <div className={styles.credentialsOk}>
              <Icon name="check" size={16} />
              <span>Credenciales configuradas</span>
            </div>
          ) : (
            <div className={styles.credentialsMissing}>
              <Icon name="close" size={16} />
              <span>Credenciales no configuradas</span>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className={styles.toggles}>
          <div className={styles.toggleItem}>
            <span className={styles.toggleLabel}>Activo</span>
            <button
              className={`${styles.toggle} ${gateway.isActive ? styles.toggleOn : styles.toggleOff}`}
              onClick={handleToggleActive}
              disabled={isUpdating || !gateway.hasCredentials}
              title={!gateway.hasCredentials ? "Configure las credenciales primero" : ""}
            >
              <span className={styles.toggleHandle} />
            </button>
          </div>

          <div className={styles.toggleItem}>
            <span className={styles.toggleLabel}>Modo</span>
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeButton} ${gateway.isSandbox ? styles.modeActive : ""}`}
                onClick={handleToggleSandbox}
                disabled={isUpdating || !gateway.isSandbox}
              >
                Sandbox
              </button>
              <button
                className={`${styles.modeButton} ${!gateway.isSandbox ? styles.modeActive : ""}`}
                onClick={handleToggleSandbox}
                disabled={isUpdating || gateway.isSandbox}
              >
                Producción
              </button>
            </div>
          </div>
        </div>

        {/* Test Connection */}
        <div className={styles.testSection}>
          <button
            className={styles.testButton}
            onClick={handleTestConnection}
            disabled={isTesting || !gateway.hasCredentials}
          >
            {isTesting ? (
              <>
                <span className={styles.spinner} />
                Probando conexión...
              </>
            ) : (
              <>
                <Icon name="check" size={16} />
                Probar conexión
              </>
            )}
          </button>

          {testResult && (
            <div
              className={`${styles.testResult} ${
                testResult.connected ? styles.testSuccess : styles.testError
              }`}
            >
              <Icon name={testResult.connected ? "check" : "close"} size={16} />
              <div className={styles.testResultContent}>
                <span className={styles.testResultMessage}>{testResult.message}</span>
                <span className={styles.testResultEnv}>Entorno: {testResult.environment}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.lastUpdate}>
          Última actualización: {new Date(gateway.updatedAt).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};
