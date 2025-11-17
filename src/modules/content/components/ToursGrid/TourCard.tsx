import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./TourCard.module.scss";
import { Button } from "@/components/common/Button/Button";

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

interface TourCardProps {
  /** Datos del tour */
  tour: TourCardData;
}

/**
 * Valida si un precio es válido para mostrar
 * Retorna false si el precio está vacío, es 0, o no existe
 */
function isValidPrice(price?: string): boolean {
  if (!price) return false;
  
  // Remover espacios y caracteres comunes de formato
  const cleanPrice = price.trim().replace(/[\$\.\s-]/g, "");
  
  // Verificar si es 0 o está vacío después de limpiar
  if (cleanPrice === "" || cleanPrice === "0") return false;
  
  return true;
}

/**
 * Componente TourCard para mostrar preview de un tour
 * 
 * Muestra una card con imagen, información del tour y CTA de reserva.
 * Todo el contenido (título, dificultad, precio, botón) está sobre la imagen con overlay oscuro.
 * Incluye efectos hover: overlay se oscurece, subtitle aparece con fade in, y zoom de imagen.
 * 
 * El precio se oculta automáticamente si está vacío, es 0, o no existe.
 * 
 * @param tour - Datos del tour a mostrar
 * 
 * @example
 * ```tsx
 * <TourCard
 *   tour={{
 *     id: "trekking-glaciar",
 *     featuredImage: "/images/tours/glaciar.jpg",
 *     subtitle: "Aventura",
 *     title: "TREKKING GLACIAR OJO DE ALBINO",
 *     difficulty: "ALTA",
 *     price: "$ 295.000.-"
 *   }}
 * />
 * ```
 */
export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const showPrice = isValidPrice(tour.price);

  return (
    <Link href={`/tours/${tour.id}`} className={styles.tourCard}>
      <div className={styles.imageWrapper}>
        <Image
          src={tour.featuredImage}
          alt={tour.title}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className={styles.overlay} />
        <div className={styles.content}>
          <div className={styles.subtitle}>{tour.subtitle}</div>
          <h3 className={styles.title}>{tour.title}</h3>
          <div className={styles.details}>
            <span className={styles.difficulty}>Dificultad: {tour.difficulty}</span>
            {showPrice && <span className={styles.price}>{tour.price}</span>}
          </div>
          <Button variant="secondary" size="medium" className={styles.cta}>
            RESERVAR
          </Button>
        </div>
      </div>
    </Link>
  );
};
