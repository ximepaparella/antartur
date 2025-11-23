import React from "react";
import styles from "./ToursGrid.module.scss";
import { TourCard, type TourCardData } from "./TourCard";

interface ToursGridProps {
  /** Array de tours a mostrar */
  tours: TourCardData[];
  /** Categoría opcional para filtrar tours. Si se proporciona, solo muestra tours de esa categoría */
  category?: "winter" | "summer";
}

/**
 * Componente ToursGrid para mostrar una grilla de tours
 * 
 * Muestra una grilla responsive:
 * - 1 columna en mobile
 * - 3 columnas en desktop
 * 
 * Puede filtrar tours por categoría si se proporciona la prop `category`.
 * 
 * @param tours - Array de tours a mostrar
 * @param category - Categoría opcional para filtrar (winter o summer)
 * 
 * @example
 * ```tsx
 * const tours = await getToursServer({ category: "winter", isActive: true });
 * <ToursGrid tours={tours.data.map(toTourCardData)} category="winter" />
 * ```
 */
export const ToursGrid: React.FC<ToursGridProps> = ({ tours, category }) => {
  // Filtrar tours por categoría si se proporciona
  const filteredTours = category
    ? tours.filter((tour) => tour.category === category)
    : tours;

  if (filteredTours.length === 0) {
    return null;
  }

  return (
    <section className={styles.toursGrid}>
      {filteredTours.map((tour) => (
        <TourCard key={tour.id} tour={tour} />
      ))}
    </section>
  );
};

