/**
 * Hook para manejar el estado centralizado del checkout
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { BillingInfo, Passenger } from "@/lib/types/order";
import {
  validateAll,
  validateBillingField,
  validatePassengerField,
  type ValidationErrors,
} from "./useCheckoutValidation";
import { updatePendingBookingPassengers } from "@/lib/utils/orderStorage";

interface UseCheckoutStateProps {
  initialPassengers: Passenger[];
  initialBillingInfo: BillingInfo;
  hasPregnancyRestriction: boolean;
  hasHealthRestriction: boolean;
  onPassengersChange?: (adults: number, children: number) => void;
}

interface CheckoutState {
  passengers: Passenger[];
  billingInfo: BillingInfo;
  errors: ValidationErrors;
}

export function useCheckoutState({
  initialPassengers,
  initialBillingInfo,
  hasPregnancyRestriction,
  hasHealthRestriction,
  onPassengersChange,
}: UseCheckoutStateProps) {
  const [passengers, setPassengers] = useState<Passenger[]>(initialPassengers);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>(initialBillingInfo);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const isInitialMount = useRef(true);

  // Sincronizar pasajeros cuando cambien los iniciales
  useEffect(() => {
    if (initialPassengers.length > 0 && passengers.length === 0) {
      setPassengers(initialPassengers);
    }
  }, [initialPassengers, passengers.length]);

  // Notificar cambios en pasajeros después del render (evita setState durante render)
  useEffect(() => {
    // No notificar en el mount inicial
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (onPassengersChange) {
      const adults = passengers.filter((p) => p.esAdulto).length;
      const children = passengers.filter((p) => !p.esAdulto).length;
      onPassengersChange(adults, children);
    }
  }, [passengers, onPassengersChange]);

  const restrictions = useMemo(
    () => ({
      hasPregnancyRestriction,
      hasHealthRestriction,
    }),
    [hasPregnancyRestriction, hasHealthRestriction]
  );

  // Validar todo el formulario
  const validateAllFields = useCallback(() => {
    const result = validateAll(billingInfo, passengers, restrictions);
    setErrors(result.errors);
    return result.isValid;
  }, [billingInfo, passengers, restrictions]);

  // Validar un campo de facturación
  const validateBilling = useCallback(
    (field: keyof BillingInfo, value: string) => {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        const errorKey = `billing.${field}`;
        
        // Limpiar error previo
        delete newErrors[errorKey];
        
        // Validar campo
        const error = validateBillingField(field, value, billingInfo);
        if (error) {
          newErrors[errorKey] = error;
        }
        
        return newErrors;
      });
    },
    [billingInfo]
  );

  // Validar un pasajero completo (usado cuando cambia cualquier campo)
  const validatePassenger = useCallback(
    (index: number) => {
      setPassengers((currentPassengers) => {
        const passenger = currentPassengers[index];
        
        if (passenger) {
          setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            
            // Limpiar todos los errores previos de este pasajero
            Object.keys(newErrors).forEach((key) => {
              if (key.startsWith(`passenger.${index}.`)) {
                delete newErrors[key];
              }
            });
            
            // Revalidar todos los campos del pasajero
            const passengerErrors = validatePassengerField(
              passenger,
              index,
              "",
              restrictions
            );
            
            Object.assign(newErrors, passengerErrors);
            return newErrors;
          });
        }
        
        return currentPassengers;
      });
    },
    [restrictions]
  );

  // Actualizar información de facturación
  const updateBillingInfo = useCallback((updates: Partial<BillingInfo>) => {
    setBillingInfo((prev) => ({ ...prev, ...updates }));
  }, []);

  // Actualizar un pasajero
  const updatePassenger = useCallback(
    (index: number, updates: Partial<Passenger>) => {
      setPassengers((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...updates };
        
        // Validar inmediatamente con el estado actualizado
        const updatedPassenger = updated[index];
        if (updatedPassenger) {
          setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            
            // Limpiar todos los errores previos de este pasajero
            Object.keys(newErrors).forEach((key) => {
              if (key.startsWith(`passenger.${index}.`)) {
                delete newErrors[key];
              }
            });
            
            // Revalidar todos los campos del pasajero
            const passengerErrors = validatePassengerField(
              updatedPassenger,
              index,
              "",
              restrictions
            );
            
            Object.assign(newErrors, passengerErrors);
            return newErrors;
          });
        }
        
        return updated;
      });
    },
    [restrictions]
  );

  // Reemplazar un pasajero completo (para cambios complejos)
  const replacePassenger = useCallback(
    (index: number, passenger: Passenger) => {
      setPassengers((prev) => {
        const updated = [...prev];
        updated[index] = passenger;
        
        // Validar usando el pasajero actualizado del array (no el parámetro)
        // para asegurar que siempre validamos con el estado más reciente
        const passengerToValidate = updated[index];
        
        // Validar inmediatamente con el estado actualizado
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          
          // Limpiar todos los errores previos de este pasajero
          Object.keys(newErrors).forEach((key) => {
            if (key.startsWith(`passenger.${index}.`)) {
              delete newErrors[key];
            }
          });
          
          // Revalidar todos los campos del pasajero usando el pasajero del array actualizado
          const passengerErrors = validatePassengerField(
            passengerToValidate,
            index,
            "",
            restrictions
          );
          
          Object.assign(newErrors, passengerErrors);
          return newErrors;
        });
        
        return updated;
      });
    },
    [restrictions]
  );

  // Agregar pasajero
  const addPassenger = useCallback(
    (isAdult: boolean) => {
      const newPassenger: Passenger = {
        nombreCompleto: "",
        fechaNacimiento: "",
        documento: "",
        direccion: "",
        telefono: "",
        tieneRestriccionesAlimentarias: false,
        esAdulto: isAdult,
        ...(isAdult && {
          embarazada: undefined,
          problemasColumnaSalud: undefined,
        }),
      };
      
      setPassengers((prev) => {
        const updated = [...prev, newPassenger];
        
        // Actualizar localStorage
        const adults = updated.filter((p) => p.esAdulto).length;
        const children = updated.filter((p) => !p.esAdulto).length;
        updatePendingBookingPassengers(adults, children);
        
        // La notificación se hará en useEffect para evitar setState durante render
        
        return updated;
      });
    },
    []
  );

  // Eliminar pasajero
  const removePassenger = useCallback(
    (index: number) => {
      setPassengers((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        
        // Actualizar localStorage
        const adults = updated.filter((p) => p.esAdulto).length;
        const children = updated.filter((p) => !p.esAdulto).length;
        updatePendingBookingPassengers(adults, children);
        
        // La notificación se hará en useEffect para evitar setState durante render
        
        return updated;
      });
      
      // Limpiar errores del pasajero eliminado y reindexar
      setErrors((prevErrors) => {
        const newErrors: ValidationErrors = {};
        
        Object.keys(prevErrors).forEach((key) => {
          if (key.startsWith("passenger.")) {
            const match = key.match(/^passenger\.(\d+)\.(.+)$/);
            if (match) {
              const oldIndex = parseInt(match[1]);
              const field = match[2];
              
              if (oldIndex < index) {
                // Mantener errores de pasajeros anteriores
                newErrors[key] = prevErrors[key];
              } else if (oldIndex > index) {
                // Reindexar errores de pasajeros posteriores
                newErrors[`passenger.${oldIndex - 1}.${field}`] = prevErrors[key];
              }
              // Ignorar errores del pasajero eliminado
            }
          } else {
            // Mantener errores de billing
            newErrors[key] = prevErrors[key];
          }
        });
        
        return newErrors;
      });
    },
    []
  );

  // Estados derivados
  const hasValidationErrors = useMemo(
    () => Object.keys(errors).length > 0,
    [errors]
  );

  const hasRestrictionViolations = useMemo(() => {
    if (!hasPregnancyRestriction && !hasHealthRestriction) return false;
    
    return passengers.some((passenger) => {
      if (!passenger.esAdulto) return false;
      if (hasPregnancyRestriction && passenger.embarazada === true) return true;
      if (hasHealthRestriction && passenger.problemasColumnaSalud === true)
        return true;
      return false;
    });
  }, [passengers, hasPregnancyRestriction, hasHealthRestriction]);

  const isValid = useMemo(
    () => !hasValidationErrors && !hasRestrictionViolations,
    [hasValidationErrors, hasRestrictionViolations]
  );

  return {
    // Estado
    passengers,
    billingInfo,
    errors,
    
    // Estados derivados
    hasValidationErrors,
    hasRestrictionViolations,
    isValid,
    
    // Acciones
    updateBillingInfo,
    updatePassenger,
    replacePassenger,
    addPassenger,
    removePassenger,
    validateBilling,
    validatePassenger,
    validateAllFields,
  };
}

