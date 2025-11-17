import React from "react";
import styles from "./Card.module.scss";

interface CardProps {
  /** Contenido de la card */
  children: React.ReactNode;
  /** Título opcional de la card */
  title?: string;
  /** Clase CSS adicional */
  className?: string;
  /** Si la card tiene padding reducido */
  compact?: boolean;
}

/**
 * Componente Card reutilizable
 * 
 * Card con bordes redondeados, sombra y padding configurable.
 * 
 * @example
 * ```tsx
 * <Card title="Mi Card">
 *   <p>Contenido de la card</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = "",
  compact = false,
}) => {
  return (
    <div className={`${styles.card} ${compact ? styles.compact : ""} ${className}`.trim()}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

