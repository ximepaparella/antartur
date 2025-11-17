/**
 * Hook y funciones de validación para el checkout
 * Centraliza toda la lógica de validación en funciones puras
 */

import type { BillingInfo, Passenger } from "@/lib/types/order";

export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationResult {
  errors: ValidationErrors;
  isValid: boolean;
}

interface ValidationRestrictions {
  hasPregnancyRestriction: boolean;
  hasHealthRestriction: boolean;
}

/**
 * Valida un campo de facturación individual
 */
export function validateBillingField(
  field: keyof BillingInfo,
  value: string,
  billingInfo: BillingInfo
): string | null {
  if (!value.trim()) {
    return "* El campo es obligatorio";
  }
  
  if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "* El email debe ser válido";
  }
  
  return null;
}

/**
 * Valida toda la información de facturación
 */
export function validateBillingInfo(billingInfo: BillingInfo): ValidationResult {
  const errors: ValidationErrors = {};
  
  const requiredFields: Array<keyof BillingInfo> = [
    "nombreCompleto",
    "apellidos",
    "email",
    "telefono",
    "direccion",
    "ciudad",
    "provincia",
    "codigoPostal",
    "pais",
    "documento",
  ];
  
  requiredFields.forEach((field) => {
    const error = validateBillingField(field, billingInfo[field] || "", billingInfo);
    if (error) {
      errors[`billing.${field}`] = error;
    }
  });
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

/**
 * Valida un pasajero individual
 */
export function validatePassenger(
  passenger: Passenger,
  index: number,
  restrictions: ValidationRestrictions
): ValidationErrors {
  const errors: ValidationErrors = {};
  
  // Validar campos básicos
  if (!passenger.nombreCompleto.trim()) {
    errors[`passenger.${index}.nombreCompleto`] = "* El campo es obligatorio";
  }
  
  if (!passenger.fechaNacimiento) {
    errors[`passenger.${index}.fechaNacimiento`] = "* El campo es obligatorio";
  }
  
  if (!passenger.documento.trim()) {
    errors[`passenger.${index}.documento`] = "* El campo es obligatorio";
  }
  
  if (!passenger.direccion.trim()) {
    errors[`passenger.${index}.direccion`] = "* El campo es obligatorio";
  }
  
  if (!passenger.telefono.trim()) {
    errors[`passenger.${index}.telefono`] = "* El campo es obligatorio";
  }
  
  // Validar restricciones alimentarias
  if (passenger.tieneRestriccionesAlimentarias === undefined) {
    errors[`passenger.${index}.restricciones`] = "* El campo es obligatorio";
  }
  
  if (
    passenger.tieneRestriccionesAlimentarias &&
    passenger.restriccionesAlimentarias?.alergias &&
    !passenger.restriccionesAlimentarias.alergiasDetalle?.trim()
  ) {
    errors[`passenger.${index}.alergias`] = "* El campo es obligatorio";
  }
  
  // Validaciones para adultos
  if (passenger.esAdulto) {
    if (restrictions.hasPregnancyRestriction && passenger.embarazada === undefined) {
      errors[`passenger.${index}.embarazada`] = "* El campo es obligatorio";
    }
    
    if (restrictions.hasHealthRestriction && passenger.problemasColumnaSalud === undefined) {
      errors[`passenger.${index}.salud`] = "* El campo es obligatorio";
    }
  }
  
  return errors;
}

/**
 * Valida todos los pasajeros
 */
export function validatePassengers(
  passengers: Passenger[],
  restrictions: ValidationRestrictions
): ValidationErrors {
  const errors: ValidationErrors = {};
  
  passengers.forEach((passenger, index) => {
    const passengerErrors = validatePassenger(passenger, index, restrictions);
    Object.assign(errors, passengerErrors);
  });
  
  return errors;
}

/**
 * Valida todo el formulario (billing + passengers)
 */
export function validateAll(
  billingInfo: BillingInfo,
  passengers: Passenger[],
  restrictions: ValidationRestrictions
): ValidationResult {
  const billingResult = validateBillingInfo(billingInfo);
  const passengerErrors = validatePassengers(passengers, restrictions);
  
  const allErrors = {
    ...billingResult.errors,
    ...passengerErrors,
  };
  
  return {
    errors: allErrors,
    isValid: Object.keys(allErrors).length === 0,
  };
}

/**
 * Valida un campo específico de pasajero y retorna solo los errores de ese pasajero
 */
export function validatePassengerField(
  passenger: Passenger,
  index: number,
  field: string,
  restrictions: ValidationRestrictions
): ValidationErrors {
  // Validar solo este pasajero completo (para limpiar errores obsoletos)
  return validatePassenger(passenger, index, restrictions);
}

