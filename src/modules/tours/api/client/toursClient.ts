/**
 * Cliente API para Tours
 * Consolidado: funciones para Client Components y Server Components
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface GetToursOptions {
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

export interface GetTourOptions {
  includeImages?: boolean;
  includeDepartures?: boolean;
  includePrices?: boolean;
  includeContent?: boolean;
}

/**
 * Cliente para Client Components (sin cache)
 */
export const toursClient = {
  client: {
    /**
     * Obtiene un tour por ID (para Client Components)
     */
    async getById(id: string, options: GetTourOptions = {}) {
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
    },

    /**
     * Obtiene un tour por slug (para Client Components)
     */
    async getBySlug(slug: string, options: GetTourOptions = {}) {
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
    },
  },

  server: {
    /**
     * Lista todos los tours con filtros opcionales (Server Component con revalidate)
     */
    async list(options: GetToursOptions = {}) {
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
    },

    /**
     * Obtiene un tour por ID (Server Component con revalidate)
     */
    async getById(id: string, options: GetTourOptions = {}) {
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
    },

    /**
     * Obtiene un tour por slug (Server Component con revalidate)
     */
    async getBySlug(slug: string, options: GetTourOptions = {}) {
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
    },
  },
};

// Exportar funciones legacy para compatibilidad durante migración
export const getTourByIdClient = toursClient.client.getById;
export const getTourBySlugClient = toursClient.client.getBySlug;
export const getTours = toursClient.server.list;
export const getTourById = toursClient.server.getById;
export const getTourBySlug = toursClient.server.getBySlug;

