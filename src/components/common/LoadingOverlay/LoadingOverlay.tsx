"use client";

import React from "react";
import styles from "./LoadingOverlay.module.scss";

interface LoadingOverlayProps {
  message?: string;
}

/**
 * Componente LoadingOverlay que bloquea toda la pantalla durante el procesamiento
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = "Procesando..." 
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.spinner} />
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};
