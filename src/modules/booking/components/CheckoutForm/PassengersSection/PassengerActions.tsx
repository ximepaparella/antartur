"use client";

import React from "react";
import { Button } from "@/components/common/Button/Button";
import { Icon } from "@/components/icons/Icon";
import styles from "../CheckoutForm.module.scss";

interface PassengerActionsProps {
  onAddAdult: () => void;
  onAddChild: () => void;
  onAddInfant?: () => void;
  minAge?: number | null;
  allowsInfants?: boolean;
}

/**
 * Componente PassengerActions para los botones de agregar pasajeros
 */
export const PassengerActions: React.FC<PassengerActionsProps> = ({
  onAddAdult,
  onAddChild,
  onAddInfant,
  minAge,
  allowsInfants = false,
}) => {
  return (
    <div className={styles.passengersActions}>
      <Button
        variant="outline"
        size="small"
        onClick={onAddAdult}
        aria-label="Agregar pasajero adulto"
      >
        <Icon name="users" size={16} aria-hidden="true" />
        Agregar adulto
      </Button>
      {(!minAge || minAge < 15) && (
        <Button
          size="small"
          variant="outline"
          onClick={onAddChild}
          aria-label="Agregar pasajero niño"
        >
          <Icon name="users" size={16} aria-hidden="true" />
          Agregar niño
        </Button>
      )}
      {allowsInfants && onAddInfant && (!minAge || minAge <= 3) && (
        <Button
          size="small"
          variant="outline"
          onClick={onAddInfant}
          aria-label="Agregar pasajero infante"
        >
          <Icon name="users" size={16} aria-hidden="true" />
          Agregar infante
        </Button>
      )}
    </div>
  );
};

