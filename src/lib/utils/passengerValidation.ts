/**
 * Utilidades para validación de pasajeros
 * Funciones puras y reutilizables para validar edades según tipo de pasajero
 */

/**
 * Valida que un adulto tenga al menos 18 años
 */
export function validateAdultAge(age: number | null): { valid: boolean; error?: string } {
  if (age === null) return { valid: false, error: "La edad no puede ser nula" };
  if (age < 18) {
    return { valid: false, error: "Los adultos deben tener al menos 18 años" };
  }
  return { valid: true };
}

/**
 * Valida que un niño tenga menos de 18 años y al menos 0 años
 */
export function validateChildAge(age: number | null): { valid: boolean; error?: string } {
  if (age === null) return { valid: false, error: "La edad no puede ser nula" };
  if (age >= 18) {
    return { valid: false, error: "Los menores deben tener menos de 18 años" };
  }
  if (age < 0) {
    return { valid: false, error: "La edad no puede ser negativa" };
  }
  return { valid: true };
}

/**
 * Valida que un infante tenga entre 0 y 3 años
 */
export function validateInfantAge(age: number | null, infantMaxAge: number = 3): { valid: boolean; error?: string } {
  if (age === null) return { valid: false, error: "La edad no puede ser nula" };
  if (age < 0) {
    return { valid: false, error: "La edad no puede ser negativa" };
  }
  if (age > infantMaxAge) {
    return { valid: false, error: `Los infantes deben tener entre 0 y ${infantMaxAge} años` };
  }
  return { valid: true };
}

/**
 * Valida la edad según el tipo de pasajero (adulto, niño o infante)
 */
export function validatePassengerAge(
  age: number | null,
  isAdult: boolean,
  isInfant: boolean = false,
  infantMaxAge: number = 3
): { valid: boolean; error?: string } {
  if (isInfant) {
    return validateInfantAge(age, infantMaxAge);
  }
  if (isAdult) {
    return validateAdultAge(age);
  }
  return validateChildAge(age);
}
