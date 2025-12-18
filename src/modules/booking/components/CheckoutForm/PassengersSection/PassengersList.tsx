"use client";

import React from "react";
import { PassengerForm } from "../PassengerForm";
import type { Passenger } from "@/lib/types/order";

interface PassengersListProps {
  passengers: Passenger[];
  errors: Record<string, string>;
  hasPregnancyRestriction: boolean;
  hasHealthRestriction: boolean;
  minAge?: number | null;
  allowsInfants?: boolean;
  infantMaxAge?: number;
  onPassengerChange: (index: number, passenger: Passenger, touchedField?: string) => void;
  onPassengerValidate: (index: number) => void;
  onMarkFieldAsTouched?: (fieldKey: string) => void;
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
  minAge,
  allowsInfants,
  infantMaxAge,
  onPassengerChange,
  onPassengerValidate,
  onMarkFieldAsTouched,
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

        // Usar ID único del pasajero como key, o generar uno basado en índice si no existe (para compatibilidad)
        const passengerKey = passenger.id || `passenger-${index}`;

        return (
          <PassengerForm
            key={passengerKey}
            passengerNumber={index + 1}
            isAdult={passenger.esAdulto}
            isInfant={passenger.esInfante ?? false}
            passenger={passenger}
            onChange={(updated, touchedField) => onPassengerChange(index, updated, touchedField)}
            onValidateField={() => onPassengerValidate(index)}
            onMarkFieldAsTouched={onMarkFieldAsTouched}
            passengerIndex={index}
            hasPregnancyRestriction={hasPregnancyRestriction}
            hasHealthRestriction={hasHealthRestriction}
            minAge={minAge}
            allowsInfants={allowsInfants}
            infantMaxAge={infantMaxAge}
            errors={passengerErrors}
            hasErrors={hasErrors}
            canRemove={passengers.length > 1}
            onRemove={() => {
              // Asegurar que siempre usamos el índice actual del array
              // El índice se captura en el momento del render, así que es correcto
              onPassengerRemove(index);
            }}
          />
        );
      })}
    </>
  );
};

