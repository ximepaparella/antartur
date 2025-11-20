import React from "react";
import { Input } from "@/components/common/Input";
import styles from "../Calendar.module.scss";

interface PassengerInputsProps {
  adults: number;
  childrenCount: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
}

/**
 * Componente PassengerInputs para los campos de entrada de pasajeros
 */
export const PassengerInputs: React.FC<PassengerInputsProps> = ({
  adults,
  childrenCount,
  onAdultsChange,
  onChildrenChange,
}) => {
  return (
    <div className={styles.passengersRow}>
      <div className={styles.passengerInput}>
        <Input
          label="Pasajeros Adultos"
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
      </div>
      <div className={styles.passengerInput}>
        <Input
          label="Pasajeros Menores (0-11 años)"
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
        <p className={styles.helperText}>Máximo 11 pasajeros menores</p>
      </div>
    </div>
  );
};

