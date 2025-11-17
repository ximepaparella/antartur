import React, { SelectHTMLAttributes, useId } from "react";
import styles from "./Select.module.scss";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  /** Label del select */
  label?: string;
  /** Si el campo es requerido */
  required?: boolean;
  /** Opciones del select */
  options: SelectOption[];
  /** Mensaje de error */
  error?: string;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente Select reutilizable
 * 
 * Select con label, opciones y estilos consistentes.
 * 
 * @example
 * ```tsx
 * <Select
 *   label="Cantidad"
 *   name="cantidad"
 *   options={[
 *     { value: 1, label: "1" },
 *     { value: 2, label: "2" }
 *   ]}
 * />
 * ```
 */
export const Select: React.FC<SelectProps> = ({
  label,
  required,
  options,
  error,
  className = "",
  id,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || `select-${props.name || generatedId}`;

  return (
    <div className={`${styles.selectGroup} ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`${styles.select} ${error ? styles.error : ""}`.trim()}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

