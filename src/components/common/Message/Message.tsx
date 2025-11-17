import React from "react";
import { Icon } from "@/components/icons/Icon";
import styles from "./Message.module.scss";

export type MessageVariant = "warning" | "alert" | "success" | "info";

interface MessageProps {
  /** Variante del mensaje */
  variant?: MessageVariant;
  /** Contenido del mensaje */
  children: React.ReactNode;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente Message para mostrar mensajes informativos
 * 
 * Soporta diferentes variantes: warning, alert, success, info
 * 
 * @example
 * ```tsx
 * <Message variant="warning">
 *   Este es un mensaje de advertencia
 * </Message>
 * ```
 */
export const Message: React.FC<MessageProps> = ({
  variant = "info",
  children,
  className = "",
}) => {
  const getIconName = (): "info" | "alert-circle" | "check" => {
    switch (variant) {
      case "warning":
      case "alert":
        return "alert-circle";
      case "success":
        return "check";
      case "info":
      default:
        return "info";
    }
  };

  return (
    <div className={`${styles.message} ${styles[variant]} ${className}`.trim()}>
      <Icon name={getIconName()} size={20} className={styles.icon} />
      <div className={styles.content}>{children}</div>
    </div>
  );
};

