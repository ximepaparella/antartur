"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import styles from "./ErrorBoundary.module.scss";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component para capturar errores de React y mostrar un fallback UI
 * 
 * Este componente debe ser usado dentro de Client Components o como wrapper
 * en el layout principal.
 * 
 * @example
 * ```tsx
 * <ErrorBoundaryClient>
 *   <YourComponent />
 * </ErrorBoundaryClient>
 * ```
 */
export class ErrorBoundaryClient extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Aquí puedes enviar el error a un servicio de logging (ej: Sentry, LogRocket)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <h2 className={styles.errorTitle}>Algo salió mal</h2>
            <p className={styles.errorMessage}>
              Lo sentimos, ha ocurrido un error inesperado. Por favor, intentá recargar la página.
            </p>
            {this.state.error && process.env.NODE_ENV === "development" && (
              <details className={styles.errorDetails}>
                <summary>Detalles del error (solo en desarrollo)</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className={styles.errorButton}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

