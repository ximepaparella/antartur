/**
 * Helper para generar slugs a partir de texto
 * Convierte texto a formato URL-friendly (lowercase, sin acentos, solo letras, números y guiones)
 */

export function generateSlug(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .toLowerCase()
    .normalize("NFD") // Normalizar a NFD (Normalization Form Decomposed)
    .replace(/[\u0300-\u036f]/g, "") // Remover diacríticos (acentos)
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales por guiones
    .replace(/^-+|-+$/g, ""); // Remover guiones al inicio y final
}
