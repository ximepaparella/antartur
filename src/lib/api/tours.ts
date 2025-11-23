/**
 * Servicios para consumir endpoints de Tours
 * Funciones helper para Server Components
 */

// En Server Components, usar URL absoluta solo si está definida, sino usar URL relativa
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
 * Lista todos los tours con filtros opcionales
 */
export async function getTours(options: GetToursOptions = {}) {
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

  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (difficulty) params.append("difficulty", difficulty);
  if (isActive !== undefined) params.append("isActive", String(isActive));
  if (search) params.append("search", search);
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);
  if (includeImages) params.append("includeImages", "true");
  if (includePrices) params.append("includePrices", "true");

  const url = `${API_BASE_URL}/api/tours?${params.toString()}`;
  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache por 60 segundos
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tours: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene un tour por ID
 */
export async function getTourById(id: string, options: GetTourOptions = {}) {
  const { includeImages = true, includeDepartures = false, includePrices = true, includeContent = false } = options;

  const params = new URLSearchParams();
  if (includeImages) params.append("includeImages", "true");
  if (includeDepartures) params.append("includeDepartures", "true");
  if (includePrices) params.append("includePrices", "true");
  if (includeContent) params.append("includeContent", "true");

  const baseUrl = API_BASE_URL || "";
  const url = `${baseUrl}/api/tours/${id}?${params.toString()}`;
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch tour: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene un tour por slug
 */
export async function getTourBySlug(slug: string, options: GetTourOptions = {}) {
  const { includeImages = true, includeDepartures = false, includePrices = true, includeContent = false } = options;

  const params = new URLSearchParams();
  if (includeImages) params.append("includeImages", "true");
  if (includeDepartures) params.append("includeDepartures", "true");
  if (includePrices) params.append("includePrices", "true");
  if (includeContent) params.append("includeContent", "true");

  const baseUrl = API_BASE_URL || "";
  const url = `${baseUrl}/api/tours/slug/${slug}?${params.toString()}`;
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch tour: ${response.statusText}`);
  }

  return response.json();
}

