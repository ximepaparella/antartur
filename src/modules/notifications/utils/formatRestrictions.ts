/**
 * Utility function to format passenger restrictions for display
 */

export function formatRestrictions(
  restrictions: Record<string, any> | null | undefined
): string {
  if (!restrictions) return "";
  const parts: string[] = [];
  
  // Restricciones alimentarias (foodRestrictions)
  if (restrictions.foodRestrictions) {
    const foodRestrictions = restrictions.foodRestrictions;
    const foodParts: string[] = [];
    if (foodRestrictions.vegetariano) foodParts.push("Vegetariano");
    if (foodRestrictions.vegano) foodParts.push("Vegano");
    if (foodRestrictions.celiaco) foodParts.push("Celiaco");
    if (foodRestrictions.alergias) {
      foodParts.push(`Alergias${foodRestrictions.alergiasDetalle ? `: ${foodRestrictions.alergiasDetalle}` : ""}`);
    }
    if (foodParts.length > 0) {
      parts.push(`Restricciones alimentarias: ${foodParts.join(", ")}`);
    }
  }
  
  // Embarazo
  if (restrictions.pregnant) {
    parts.push("Embarazada");
  }
  
  // Problemas de salud/columna
  if (restrictions.healthIssues) {
    parts.push("Problemas de columna/salud");
  }
  
  // Compatibilidad con formato antiguo (por si acaso)
  if (restrictions.dietary) parts.push(`Dietarias: ${restrictions.dietary}`);
  if (restrictions.medical) parts.push(`Médicas: ${restrictions.medical}`);
  if (restrictions.mobility) parts.push(`Movilidad: ${restrictions.mobility}`);
  if (restrictions.other) parts.push(`Otras: ${restrictions.other}`);
  
  return parts.length > 0 ? parts.join("; ") : "";
}
