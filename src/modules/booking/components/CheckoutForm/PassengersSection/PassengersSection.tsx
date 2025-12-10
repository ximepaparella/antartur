"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import type { Passenger } from "@/lib/types/order";
import { PassengersList } from "./PassengersList";
import { PassengerActions } from "./PassengerActions";
import styles from "../CheckoutForm.module.scss";

interface PassengersSectionProps {
  passengers: Passenger[];
  errors: Record<string, string>;
  hasPregnancyRestriction: boolean;
  hasHealthRestriction: boolean;
  minAge?: number | null;
  onPassengerChange: (index: number, passenger: Passenger) => void;
  onPassengerValidate: (index: number) => void;
  onAddPassenger: (isAdult: boolean) => void;
  onPassengerRemove: (index: number) => void;
}

/**
 * Componente PassengersSection para la sección de información de pasajeros
 */
export const PassengersSection: React.FC<PassengersSectionProps> = ({
  passengers,
  errors,
  hasPregnancyRestriction,
  hasHealthRestriction,
  minAge,
  onPassengerChange,
  onPassengerValidate,
  onAddPassenger,
  onPassengerRemove,
}) => {
  return (
    <Card title="Información de pasajeros" className={styles.section}>
      <p className={styles.sectionDescription}>
        Por favor ingrese: Nombre completo, DNI/Pasaporte y Fecha de nacimiento de cada pasajero.
      </p>

      <div className={styles.passengersList}>
        <PassengersList
          passengers={passengers}
          errors={errors}
          hasPregnancyRestriction={hasPregnancyRestriction}
          hasHealthRestriction={hasHealthRestriction}
          minAge={minAge}
          onPassengerChange={onPassengerChange}
          onPassengerValidate={onPassengerValidate}
          onPassengerRemove={onPassengerRemove}
        />
      </div>

      <PassengerActions
        onAddAdult={() => onAddPassenger(true)}
        onAddChild={() => onAddPassenger(false)}
        minAge={minAge}
      />
    </Card>
  );
};

