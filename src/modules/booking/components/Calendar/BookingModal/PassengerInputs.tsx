import React from "react";
import { Input } from "@/components/common/Input";
import { formatPriceByCurrency } from "@/lib/utils/priceFormat";
import styles from "../Calendar.module.scss";

interface PassengerInputsProps {
  adults: number;
  childrenCount: number;
  infantsCount?: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onInfantsChange?: (value: number) => void;
  priceAdult: number;
  priceChild: number;
  currency: string;
  childAgeRange?: string | null;
  description?: string | null;
  allowsChildren?: boolean; // Si el tour permite menores
  allowsInfants?: boolean; // Si el tour acepta infantes
  infantMaxAge?: number; // Edad máxima para infantes (default 3)
}

/**
 * Componente PassengerInputs para los campos de entrada de pasajeros
 */
export const PassengerInputs: React.FC<PassengerInputsProps> = ({
  adults,
  childrenCount,
  infantsCount = 0,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
  priceAdult,
  priceChild,
  currency,
  childAgeRange,
  description,
  allowsChildren = true,
  allowsInfants = false,
  infantMaxAge = 3,
}) => {
  // Construir el label dinámicamente según el rango de edad
  // Si hay infantes, los niños son 4-11 años
  const childrenLabel = allowsInfants && childAgeRange
    ? `Menores (4-11 años)`
    : childAgeRange 
    ? ` Menores (${childAgeRange} años)`
    : "Menores";

  return (
    <div className={styles.passengersRow}>
      <div className={styles.passengerInput}>
        <Input
          label="Adultos"
          name="adults"
          type="number"
          min="1"
          max="10"
          required
          value={adults.toString()}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 1 && value <= 10) {
              onAdultsChange(value);
            }
          }}
        />
        <p className={styles.priceText}>
          {formatPriceByCurrency(priceAdult, currency)} por adulto
        </p>
      </div>
      {allowsChildren && (
        <div className={styles.passengerInput}>
          <Input
            label={childrenLabel}
            name="children"
            type="number"
            min="0"
            max="11"
            value={childrenCount.toString()}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0 && value <= 11) {
                onChildrenChange(value);
              }
            }}
          />
          <p className={styles.priceText}>
            {formatPriceByCurrency(priceChild, currency)} por menor
          </p>
          {description && (
            <p className={styles.helperText}>{description}</p>
          )}
        </div>
      )}
      {allowsInfants && onInfantsChange && (
        <div className={styles.passengerInput}>
          <Input
            label={`Infantes (0-${infantMaxAge} años)`}
            name="infants"
            type="number"
            min="0"
            max="10"
            value={infantsCount.toString()}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0 && value <= 10) {
                onInfantsChange(value);
              }
            }}
          />
          <p className={styles.priceText}>
            Gratis
          </p>
        </div>
      )}
    </div>
  );
};

