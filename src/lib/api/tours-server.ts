/**
 * Servicios para consumir datos de Tours directamente desde el servidor
 * Usa los controllers directamente en lugar de fetch HTTP para mejor performance
 * Solo para uso en Server Components
 */

import { ToursController } from "@/modules/tours/api/controllers/toursController";
import { NextRequest } from "next/server";

const controller = new ToursController();

interface GetToursOptions {
  category?: string;
  difficulty?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeImages?: boolean;
  includePrices?: boolean;
}

interface GetTourOptions {
  includeImages?: boolean;
  includeDepartures?: boolean;
  includePrices?: boolean;
  includeContent?: boolean;
}

/**
 * Lista todos los tours con filtros opcionales (Server Component)
 */
export async function getToursServer(options: GetToursOptions = {}) {
  const {
    category,
    difficulty,
    isActive,
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    includeImages = true,
    includePrices = true,
  } = options;

  // Crear un mock NextRequest para el controller
  const url = new URL("http://localhost/api/tours");
  if (category) url.searchParams.append("category", category);
  if (difficulty) url.searchParams.append("difficulty", difficulty);
  if (isActive !== undefined) url.searchParams.append("isActive", String(isActive));
  if (search) url.searchParams.append("search", search);
  if (page) url.searchParams.append("page", String(page));
  if (limit) url.searchParams.append("limit", String(limit));
  if (sortBy) url.searchParams.append("sortBy", sortBy);
  if (sortOrder) url.searchParams.append("sortOrder", sortOrder);
  if (includeImages) url.searchParams.append("includeImages", "true");
  if (includePrices) url.searchParams.append("includePrices", "true");

  const request = new NextRequest(url);
  const result = await controller.list(request);

  return result;
}

/**
 * Obtiene un tour por ID (Server Component)
 */
export async function getTourByIdServer(id: string, options: GetTourOptions = {}) {
  const { includeImages = true, includeDepartures = false, includePrices = true, includeContent = false } = options;
  return controller.getById(id, includeDepartures, includeContent);
}

/**
 * Obtiene un tour por slug (Server Component)
 */
export async function getTourBySlugServer(slug: string, options: GetTourOptions = {}) {
  const { includeImages = true, includeDepartures = false, includePrices = true, includeContent = false } = options;
  const result = await controller.getBySlug(slug, includeImages, includeDepartures, includePrices, includeContent);
  return result as Awaited<ReturnType<typeof controller.getBySlug>>;
}

