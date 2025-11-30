"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/common/Button/Button";
import styles from "./ErrorBoundary.module.scss";

interface RouteErrorBoundaryProps {
  children: ReactNode;
  /** Mensaje personalizado para mostrar al usuario */
  message?: string;
  /** Callback cuando ocurre un error */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary específico para rutas/páginas
 * 
 * Úsalo para envolver páginas completas y capturar errores a nivel de ruta.
 * 
 * @example
 * ```tsx
 * <RouteErrorBoundary>
 *   <CheckoutPage />
 * </RouteErrorBoundary>
 * ```
 */
export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service (e.g., Sentry, LogRocket)
    console.error("[RouteErrorBoundary] Caught an error:", error, errorInfo);
    
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

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <h2 className={styles.errorTitle}>Error al cargar la página</h2>
            <p className={styles.errorMessage}>
              {this.props.message || 
                "Lo sentimos, ha ocurrido un error al cargar esta página. Por favor, intentá recargar o volver al inicio."}
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
                onClick={this.handleReset}
              >
                Intentar de nuevo
              </Button>
              <Button
                variant="outline"
                onClick={this.handleReload}
              >
                Recargar página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

