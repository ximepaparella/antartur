"use client";

import React from "react";
import { PassengerForm } from "../PassengerForm";
import type { Passenger } from "@/lib/types/order";

interface PassengersListProps {
  passengers: Passenger[];
  errors: Record<string, string>;
  hasPregnancyRestriction: boolean;
  hasHealthRestriction: boolean;
  onPassengerChange: (index: number, passenger: Passenger) => void;
  onPassengerValidate: (index: number) => void;
  onPassengerRemove: (index: number) => void;
}

/**
 * Componente PassengersList para renderizar la lista de pasajeros
 */
export const PassengersList: React.FC<PassengersListProps> = ({
  passengers,
  errors,
  hasPregnancyRestriction,
  hasHealthRestriction,
  onPassengerChange,
  onPassengerValidate,
  onPassengerRemove,
}) => {
  return (
    <>
      {passengers.map((passenger, index) => {
        // Extraer errores específicos de este pasajero
        const passengerErrors: Record<string, string> = {};
        Object.keys(errors).forEach((key) => {
          if (key.startsWith(`passenger.${index}.`)) {
            const field = key.replace(`passenger.${index}.`, "");
            passengerErrors[field] = errors[key];
          }
        });

        // Verificar si este pasajero tiene errores
        const hasErrors = Object.keys(passengerErrors).length > 0;

        return (
          <PassengerForm
            key={index}
            passengerNumber={index + 1}
            isAdult={passenger.esAdulto}
            passenger={passenger}
            onChange={(updated) => onPassengerChange(index, updated)}
            onValidateField={() => onPassengerValidate(index)}
            hasPregnancyRestriction={hasPregnancyRestriction}
            hasHealthRestriction={hasHealthRestriction}
            errors={passengerErrors}
            hasErrors={hasErrors}
            canRemove={passengers.length > 1}
            onRemove={() => onPassengerRemove(index)}
          />
        );
      })}
    </>
  );
};

