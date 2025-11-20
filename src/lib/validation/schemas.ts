/**
 * Schemas Zod base para validación común
 */

import { z } from "zod";

/**
 * Schema de paginación
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Schema de filtros comunes
 */
export const commonFiltersSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
});

export type CommonFiltersInput = z.infer<typeof commonFiltersSchema>;

/**
 * Schema de ID (UUID o CUID)
 */
export const idSchema = z.string().min(1, "ID is required");

/**
 * Schema de slug
 */
export const slugSchema = z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens");

/**
 * Schema de fecha (YYYY-MM-DD)
 */
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

/**
 * Schema de hora (HH:mm)
 */
export const timeSchema = z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format");

/**
 * Schema de código de moneda (3 caracteres)
 */
export const currencyCodeSchema = z.string().length(3, "Currency code must be 3 characters");

/**
 * Schema de email
 */
export const emailSchema = z.string().email("Invalid email format");

/**
 * Schema de teléfono
 */
export const phoneSchema = z.string().min(1, "Phone is required");

/**
 * Schema de precio (decimal positivo)
 */
export const priceSchema = z.coerce.number().positive("Price must be positive");

/**
 * Validar query parameters con Zod
 */
export function validateQuery<T extends z.ZodTypeAny>(
  schema: T,
  query: Record<string, string | string[] | undefined>
): z.infer<T> {
  // Convertir arrays a strings (tomar el primer valor)
  const normalizedQuery: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(query)) {
    normalizedQuery[key] = Array.isArray(value) ? value[0] : value;
  }

  return schema.parse(normalizedQuery);
}

/**
 * Validar body con Zod
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  return schema.parse(body);
}

