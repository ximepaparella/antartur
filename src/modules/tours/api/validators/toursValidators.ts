/**
 * Validators Zod para Tours
 */

import { z } from "zod";
import { paginationSchema, commonFiltersSchema, idSchema, slugSchema, currencyCodeSchema, priceSchema } from "@/lib/validation/schemas";

/**
 * Schema para imagen de tour
 */
export const tourImageSchema = z.object({
  id: z.string().optional(),
  imageType: z.enum(["FEATURED", "HERO", "GALLERY"]),
  url: z.string().min(1),
  altText: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

/**
 * Schema para timeline item
 */
export const timelineItemSchema = z.object({
  id: z.string().optional(),
  timeLabel: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

/**
 * Schema para featured info
 */
export const featuredInfoSchema = z.object({
  id: z.string().optional(),
  icon: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

/**
 * Schema para testimonial
 */
export const testimonialSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1),
  author: z.string().min(1),
  avatar: z.string().min(1),
  country: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

/**
 * Schema para quick info item
 */
export const quickInfoItemSchema = z.object({
  id: z.string().optional(),
  icon: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

/**
 * Schema para precio de tour
 */
export const tourPriceSchema = z.object({
  id: z.string().optional(),
  currency: z.string().min(1),
  priceAdult: z.coerce.number().min(0),
  priceChild: z.coerce.number().min(0),
});

/**
 * Schema para restricción de tour
 */
export const tourRestrictionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "El texto de la restricción es requerido"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

/**
 * Schema para crear un Tour
 */
export const createTourSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "Name is required").max(200),
  subtitle: z.string().max(300).optional(),
  category: z.string().min(1, "Category is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  durationHours: z.coerce.number().int().positive("Duration must be positive"),
  featuredImage: z.string().url("Featured image must be a valid URL").or(z.string().startsWith("/")),
  heroImage: z.string().url("Hero image must be a valid URL").or(z.string().startsWith("/")),
  shortDescription: z.string().min(1, "Short description is required"),
  longDescription: z.string().min(1, "Long description is required"),
  restrictionText: z.string().optional().default(""),
  isActive: z.boolean().default(true),
  // Restricciones
  minAge: z.coerce.number().int().min(0).optional().nullable(),
  minPassengers: z.coerce.number().int().min(1).optional().nullable(),
  allowsInfants: z.boolean().optional().default(false),
});

export type CreateTourInput = z.infer<typeof createTourSchema>;

// Helper para convertir valores vacíos a null antes de la coerción numérica
const nullableNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? null : val),
  z.coerce.number().int().min(0).nullable()
);

/**
 * Schema para actualizar un Tour (incluye relaciones)
 * Todos los campos son opcionales para update parcial
 * Campos nullable: los que son nullable en Prisma schema (String?)
 */
export const updateTourSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(300).optional().nullable(), // nullable en Prisma
  category: z.string().optional(),
  difficulty: z.string().optional(),
  durationHours: z.coerce.number().int().positive().optional(),
  featuredImage: z.string().optional(),
  heroImage: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  restrictionText: z.string().optional(), // NOT nullable en Prisma
  isActive: z.boolean().optional(),
  // Restricciones - nullable en Prisma (con preprocess para valores vacíos)
  minAge: nullableNumber.optional(),
  minPassengers: nullableNumber.optional(),
  allowsInfants: z.boolean().optional(),
  // Relaciones opcionales para actualización
  images: z.array(tourImageSchema).optional(),
  timelineItems: z.array(timelineItemSchema).optional(),
  featuredInfos: z.array(featuredInfoSchema).optional(),
  testimonials: z.array(testimonialSchema).optional(),
  quickInfoItems: z.array(quickInfoItemSchema).optional(),
  // Restricciones
  restrictions: z.array(tourRestrictionSchema).optional(),
  // Precios
  prices: z.array(tourPriceSchema).optional(),
  // Additionals - schema simplificado para update de tour (tourId se asigna automáticamente)
  additionals: z.array(
    z.object({
      id: idSchema.optional(), // Para updates, omitir para crear nuevos
      name: z.string().min(1, "Name is required").max(200),
      description: z.string().optional().nullable(),
      isActive: z.boolean().default(true),
      sortOrder: z.coerce.number().int().min(0).default(0),
      prices: z.array(
        z.object({
          currency: currencyCodeSchema,
          price: priceSchema, // Precio general (no por pasajero)
        })
      ).optional(),
    })
  ).optional(),
  // SEO fields - nullable en Prisma
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  // CTA fields - nullable en Prisma
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  // Alternative pricing - nullable en Prisma
  alternativeText: z.string().optional().nullable(),
  alternativePrice: z.string().optional().nullable(),
  // Timeline note - nullable en Prisma
  timelineImportantNote: z.string().optional().nullable(),
  // Hero subheadline - nullable en Prisma
  heroSubheadline: z.string().optional().nullable(),
  // Weekdays - boolean con default true en Prisma
  mondayAvailable: z.boolean().optional(),
  tuesdayAvailable: z.boolean().optional(),
  wednesdayAvailable: z.boolean().optional(),
  thursdayAvailable: z.boolean().optional(),
  fridayAvailable: z.boolean().optional(),
  saturdayAvailable: z.boolean().optional(),
  sundayAvailable: z.boolean().optional(),
});

export type UpdateTourInput = z.infer<typeof updateTourSchema>;

/**
 * Schema para query parameters de listar tours
 */
export const listToursQuerySchema = paginationSchema.merge(commonFiltersSchema).extend({
  category: z.string().optional(),
  difficulty: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type ListToursQuery = z.infer<typeof listToursQuerySchema>;

/**
 * Schema para parámetros de ruta (ID)
 */
export const tourIdParamsSchema = z.object({
  id: idSchema,
});

export type TourIdParams = z.infer<typeof tourIdParamsSchema>;

/**
 * Schema para parámetros de ruta (slug)
 */
export const tourSlugParamsSchema = z.object({
  slug: slugSchema,
});

export type TourSlugParams = z.infer<typeof tourSlugParamsSchema>;

