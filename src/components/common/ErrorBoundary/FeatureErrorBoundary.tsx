"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/common/Button/Button";
import styles from "./ErrorBoundary.module.scss";

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  /** Nombre de la feature para mostrar en el mensaje */
  featureName?: string;
  /** Mensaje personalizado para mostrar al usuario */
  message?: string;
  /** Callback cuando ocurre un error */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Fallback UI personalizado */
  fallback?: ReactNode;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary específico para features/flujos específicos
 * 
 * Úsalo para envolver features críticas como el flujo de booking,
 * para que un error en una feature no rompa toda la página.
 * 
 * @example
 * ```tsx
 * <FeatureErrorBoundary featureName="reserva">
 *   <Calendar />
 *   <CheckoutForm />
 * </FeatureErrorBoundary>
 * ```
 */
export class FeatureErrorBoundary extends Component<FeatureErrorBoundaryProps, FeatureErrorBoundaryState> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service
    console.error(`[FeatureErrorBoundary] Error in ${this.props.featureName || 'feature'}:`, error, errorInfo);
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const featureText = this.props.featureName 
        ? ` en la sección de ${this.props.featureName}`
        : "";

      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <h2 className={styles.errorTitle}>Error{featureText}</h2>
            <p className={styles.errorMessage}>
              {this.props.message || 
                `Lo sentimos, ha ocurrido un error${featureText}. Por favor, intentá recargar la página o contactanos si el problema persiste.`}
            </p>
            {this.state.error && process.env.NODE_ENV === "development" && (
              <details className={styles.errorDetails}>
                <summary>Detalles del error (solo en desarrollo)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}
            <div className={styles.errorActions}>
              <Button
                variant="primary"
                size="small"
                onClick={this.handleReset}
              >
                Intentar de nuevo
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

