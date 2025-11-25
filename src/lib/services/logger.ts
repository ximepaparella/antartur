/**
 * Servicio centralizado de logging
 * Proporciona logging consistente en toda la aplicación
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  }

  /**
   * Log de información
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || "");
    }
    // En producción, aquí se podría enviar a un servicio de logging externo
  }

  /**
   * Log de advertencia
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || "");
    // En producción, aquí se podría enviar a un servicio de logging externo
  }

  /**
   * Log de error (siempre se muestra)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error(`[ERROR] ${message}`, {
      error: errorDetails,
      ...context,
    });
    // En producción, aquí se podría enviar a Sentry, LogRocket, etc.
  }
}

export const logger = new Logger();

