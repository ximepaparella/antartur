import React from "react";
import Link from "next/link";
import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "danger";
export type ButtonSize = "small" | "medium" | "large";

interface ButtonBaseProps {
  /** Variante del botón: "primary", "secondary", "tertiary" o "outline" */
  variant?: ButtonVariant;
  /** Tamaño del botón */
  size?: ButtonSize;
  /** Contenido del botón */
  children: React.ReactNode;
  /** Clase CSS adicional */
  className?: string;
}

interface ButtonAsButtonProps extends ButtonBaseProps {
  /** Tipo de botón (button, submit, reset) */
  type?: "button" | "submit" | "reset";
  /** Función onClick */
  onClick?: () => void;
  /** Si el botón está deshabilitado */
  disabled?: boolean;
  href?: never;
}

interface ButtonAsLinkProps extends ButtonBaseProps {
  /** URL del link */
  href: string;
  type?: never;
  onClick?: never;
  disabled?: never;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

/**
 * Componente Button genérico reutilizable
 * 
 * Soporta cinco variantes:
 * - `primary`: Fondo con color primario y texto blanco
 * - `secondary`: Fondo transparente con borde blanco y texto blanco
 * - `tertiary`: Fondo con color terciario y texto blanco
 * - `outline`: Fondo transparente con borde y texto en color primario
 * - `danger`: Fondo rojo para acciones destructivas
 * 
 * Puede renderizarse como botón (`<button>`) o como link (`<Link>` de Next.js).
 * 
 * @example
 * ```tsx
 * // Como botón
 * <Button variant="primary" onClick={() => {}}>
 *   Click me
 * </Button>
 * 
 * // Como link
 * <Button variant="secondary" href="/tours">
 *   Ver tours
 * </Button>
 * 
 * // Variante terciaria
 * <Button variant="tertiary" href="/booking">
 *   Reservar ahora
 * </Button>
 * 
 * // Variante outline
 * <Button variant="outline" onClick={handleCancel}>
 *   Cancelar
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  children,
  className = "",
  ...props
}) => {
  const baseClassName = `${styles.button} ${styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} ${styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${className}`.trim();

  if ("href" in props && props.href) {
    // Si es un link externo (http/https), usar <a> con target="_blank"
    const isExternal = props.href.startsWith("http://") || props.href.startsWith("https://");
    
    if (isExternal) {
      return (
        <a 
          href={props.href} 
          className={baseClassName}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    
    return (
      <Link href={props.href} className={baseClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type || "button"}
      className={baseClassName}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {children}
    </button>
  );
};

