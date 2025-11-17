import toursDataJson from "./toursData.json";

export interface TourCardData {
  /** ID único del tour (usado para la URL) */
  id: string;
  /** URL de la imagen destacada del tour */
  featuredImage: string;
  /** Subtítulo del tour */
  subtitle: string;
  /** Título del tour */
  title: string;
  /** Nivel de dificultad */
  difficulty: string;
  /** Precio del tour (opcional, se oculta si está vacío, es 0 o no existe) */
  price?: string;
  /** Categoría del tour: "winter" o "summer" */
  category: "winter" | "summer";
}

export type ToursData = Record<string, TourCardData>;

export const toursData: ToursData = toursDataJson as ToursData;

/**
 * Obtiene un tour por su ID
 * También busca por el ID base si no encuentra una coincidencia exacta
 * (útil para tours duplicados como "parque-nacional-clasico-winter" que apuntan a "parque-nacional-clasico")
 */
export function getTourById(id: string): TourCardData | undefined {
  // Primero intenta encontrar una coincidencia exacta
  if (toursData[id]) {
    return toursData[id];
  }
  
  // Si no encuentra, busca tours que tengan el mismo ID base
  // (para manejar casos como "parque-nacional-clasico-winter" -> "parque-nacional-clasico")
  const tour = Object.values(toursData).find((t) => t.id === id);
  return tour;
}

/**
 * Obtiene todos los tours como array
 */
export function getAllTours(): TourCardData[] {
  return Object.values(toursData);
}

/**
 * Obtiene tours por categoría
 */
export function getToursByCategory(category: "winter" | "summer"): TourCardData[] {
  return Object.values(toursData).filter((tour) => tour.category === category);
}

/**
 * Obtiene tours por IDs
 */
export function getToursByIds(ids: string[]): TourCardData[] {
  return ids.map((id) => toursData[id]).filter(Boolean) as TourCardData[];
}

