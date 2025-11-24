/**
 * Servicios para consumir endpoints de Tours desde Client Components
 * Funciones helper para Client Components (sin next.revalidate)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface GetTourOptions {
  includeImages?: boolean;
  includeDepartures?: boolean;
  includePrices?: boolean;
  includeContent?: boolean;
}

/**
 * Obtiene un tour por ID (para Client Components)
 */
export async function getTourByIdClient(id: string, options: GetTourOptions = {}) {
  const { includeImages = true, includeDepartures = false, includePrices = true, includeContent = false } = options;

  const params = new URLSearchParams();
  if (includeImages) params.append("includeImages", "true");
  if (includeDepartures) params.append("includeDepartures", "true");
  if (includePrices) params.append("includePrices", "true");
  if (includeContent) params.append("includeContent", "true");

  const baseUrl = API_BASE_URL || "";
  const url = `${baseUrl}/api/tours/${id}?${params.toString()}`;
  const response = await fetch(url, {
    cache: "no-store", // No cache para Client Components
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch tour: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data; // Extraer data del response wrapper
}

/**
 * Obtiene un tour por slug (para Client Components)
 */
export async function getTourBySlugClient(slug: string, options: GetTourOptions = {}) {
  const { includeImages = true, includeDepartures = false, includePrices = true, includeContent = false } = options;

  const params = new URLSearchParams();
  if (includeImages) params.append("includeImages", "true");
  if (includeDepartures) params.append("includeDepartures", "true");
  if (includePrices) params.append("includePrices", "true");
  if (includeContent) params.append("includeContent", "true");

  const baseUrl = API_BASE_URL || "";
  const url = `${baseUrl}/api/tours/slug/${slug}?${params.toString()}`;
  const response = await fetch(url, {
    cache: "no-store", // No cache para Client Components
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch tour: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data; // Extraer data del response wrapper
}

