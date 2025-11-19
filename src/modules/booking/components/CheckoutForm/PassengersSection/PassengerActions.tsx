"use client";

import React from "react";
import { Button } from "@/components/common/Button/Button";
import { Icon } from "@/components/icons/Icon";
import styles from "../CheckoutForm.module.scss";

interface PassengerActionsProps {
  onAddAdult: () => void;
  onAddChild: () => void;
}

/**
 * Componente PassengerActions para los botones de agregar pasajeros
 */
export const PassengerActions: React.FC<PassengerActionsProps> = ({
  onAddAdult,
  onAddChild,
}) => {
  return (
    <div className={styles.passengersActions}>
      <Button
        variant="outline"
        size="small"
        onClick={onAddAdult}
      >
        <Icon name="users" size={16} />
        Agregar adulto
      </Button>
      <Button
        size="small"
        variant="outline"
        onClick={onAddChild}
      >
        <Icon name="users" size={16} />
        Agregar niño
      </Button>
    </div>
  );
};

