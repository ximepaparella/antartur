import React, { ReactNode } from "react";
import styles from "./Tooltip.module.scss";

interface TooltipProps {
  /** Contenido del tooltip */
  children: ReactNode;
  /** Posición del tooltip relativo al elemento */
  position?: "top" | "bottom" | "left" | "right";
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente Tooltip genérico reutilizable
 * 
 * Muestra un tooltip con fondo primary y texto blanco.
 * 
 * @example
 * ```tsx
 * <Tooltip position="top">
 *   20 Disponibles
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  position = "top",
  className = "",
}) => {
  return (
    <div className={`${styles.tooltip} ${styles[position]} ${className}`.trim()}>
      {children}
    </div>
  );
};

