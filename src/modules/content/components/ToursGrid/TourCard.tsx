"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPrice, getPriceByCurrency } from "@/lib/utils/priceFormat";
import { getFullTourById } from "./tourFullData";
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
  /** Precio del tour (opcional, puede ser string legacy o objeto con ARS y USD) */
  price?: string | { ARS: number; USD: number };
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
 * También detecta strings que solo contienen ceros (ej: "0.00", "000")
 */
export function isValidPrice(price?: string): boolean {
  if (!price) return false;
  
  // Remover espacios y caracteres comunes de formato
  const cleanPrice = price.trim().replace(/[\$\.\s-]/g, "");
  
  // Verificar si está vacío, es "0", o solo contiene ceros
  if (cleanPrice === "" || cleanPrice === "0" || /^0+$/.test(cleanPrice)) {
    return false;
  }
  
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
  const { currency } = useCurrency();
  const [displayPrice, setDisplayPrice] = useState<string | undefined>();

  // Función para actualizar el precio
  const updatePrice = React.useCallback(() => {
    // Intentar obtener precio desde datos completos del tour usando el ID del tour
    // (puede ser diferente del key del objeto, especialmente para tours winter)
    const fullTour = getFullTourById(tour.id);
    if (fullTour?.booking?.pricing) {
      const pricing = fullTour.booking.pricing;
      // Usar getPriceByCurrency para obtener los precios correctos según la moneda
      const prices = getPriceByCurrency(pricing, currency);
      setDisplayPrice(formatPrice(prices.priceAdult, currency));
    } else if (tour.price) {
      // Si price es un objeto con ARS y USD
      if (typeof tour.price === "object" && "ARS" in tour.price && "USD" in tour.price) {
        const priceValue = currency === "USD" ? tour.price.USD : tour.price.ARS;
        setDisplayPrice(formatPrice(priceValue, currency));
      } else if (typeof tour.price === "string") {
        // Fallback al precio legacy si no hay pricing completo
        // El precio legacy siempre está en ARS, así que solo lo mostramos si la moneda es ARS
        if (currency === "ARS") {
          setDisplayPrice(tour.price);
        } else {
          // Si no hay pricing completo y se cambia a USD, ocultar el precio
          setDisplayPrice(undefined);
        }
      }
    }
  }, [currency, tour.id, tour.price]);

  useEffect(() => {
    updatePrice();
  }, [updatePrice]);

  // Escuchar cambios de moneda desde el evento personalizado
  useEffect(() => {
    const handleCurrencyChange = () => {
      updatePrice();
    };

    window.addEventListener("currencyChanged", handleCurrencyChange);
    return () => {
      window.removeEventListener("currencyChanged", handleCurrencyChange);
    };
  }, [updatePrice]);

  const showPrice = isValidPrice(displayPrice);

  return (
    <div className={styles.tourCard}>
      <Link href={`/tours/${tour.id}`} className={styles.cardLink}>
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
              {showPrice && <span className={styles.price}>{displayPrice}</span>}
            </div>
          </div>
        </div>
      </Link>
      <Button 
        variant="secondary" 
        size="medium" 
        className={styles.cta}
        href={`/tours/${tour.id}`}
      >
        RESERVAR
      </Button>
    </div>
  );
};
