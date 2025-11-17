import React, { InputHTMLAttributes, useId } from "react";
import styles from "./Input.module.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label del input */
  label?: string;
  /** Si el campo es requerido */
  required?: boolean;
  /** Mensaje de error */
  error?: string;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente Input reutilizable
 * 
 * Input de texto con label, validación y estilos consistentes.
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Nombre"
 *   name="nombre"
 *   required
 *   placeholder="Ingrese su nombre"
 * />
 * ```
 */
export const Input: React.FC<InputProps> = ({
  label,
  required,
  error,
  className = "",
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || `input-${props.name || generatedId}`;

  return (
    <div className={`${styles.inputGroup} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.error : ""}`.trim()}
        {...props}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

