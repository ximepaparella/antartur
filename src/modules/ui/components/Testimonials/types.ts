/**
 * Tipos TypeScript estrictos para testimonios
 */

export interface Testimonial {
  /** Texto del testimonio */
  text: string;
  /** Nombre del autor */
  author: string;
  /** URL o path de la imagen del avatar */
  avatar: string;
  /** País del autor */
  country: string;
}

/**
 * Estructura del archivo testimonialsdata.json
 */
export interface TestimonialsData {
  [pageKey: string]: Testimonial[];
}

/**
 * Valida que un objeto sea un Testimonial válido
 */
export function isValidTestimonial(data: unknown): data is Testimonial {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const testimonial = data as Record<string, unknown>;

  return (
    typeof testimonial.text === "string" &&
    testimonial.text.length > 0 &&
    typeof testimonial.author === "string" &&
    testimonial.author.length > 0 &&
    typeof testimonial.avatar === "string" &&
    testimonial.avatar.length > 0 &&
    typeof testimonial.country === "string" &&
    testimonial.country.length > 0
  );
}

/**
 * Valida que un array contenga solo testimonios válidos
 */
export function isValidTestimonialsArray(data: unknown): data is Testimonial[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every(isValidTestimonial);
}

