"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./Banner.module.scss";
import { BannerText } from "./BannerText";
import { BannerBooking } from "./BannerBooking";

export type BannerVariant = "text" | "booking";

export interface BannerTextContent {
  type: "text";
  title: string;
  excerpt: string;
  linkText: string;
  linkUrl: string;
}

export interface BannerBookingContent {
  type: "booking";
}

export type BannerContent = BannerTextContent | BannerBookingContent;

interface BannerProps {
  /** URL de la imagen de fondo */
  backgroundImage: string;
  /** Variante del banner: "text" o "booking" */
  variant: BannerVariant;
  /** Contenido del banner según la variante */
  content: BannerContent;
  /** Altura mínima del banner en píxeles (default: 500px) */
  minHeight?: number;
}

/**
 * Componente Banner con efecto parallax
 * 
 * Soporta dos variantes:
 * - `text`: Muestra una card blanca con título, extracto y link
 * - `booking`: Muestra el módulo de reservas con pasos y calendario
 * 
 * @param backgroundImage - URL de la imagen de fondo
 * @param variant - Tipo de banner: "text" o "booking"
 * @param content - Contenido según la variante
 * @param minHeight - Altura mínima del banner (default: 500px)
 * 
 * @example
 * ```tsx
 * <Banner
 *   backgroundImage="/images/banner.jpg"
 *   variant="text"
 *   content={{
 *     type: "text",
 *     title: "Título",
 *     excerpt: "Extracto del contenido",
 *     linkText: "Ver más",
 *     linkUrl: "/ruta"
 *   }}
 * />
 * ```
 */
export const Banner: React.FC<BannerProps> = ({
  backgroundImage,
  variant,
  content,
  minHeight = 500,
}) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calcular el efecto parallax basado en la posición del elemento
        if (rect.top < windowHeight && rect.bottom > 0) {
          const parallaxOffset = (rect.top - windowHeight / 2) * 0.5;
          setScrollY(parallaxOffset);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Ejecutar una vez al montar

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundPosition: "center center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    transform: `translateY(${scrollY}px)`,
  };

  return (
    <section
      ref={bannerRef}
      className={styles.banner}
      style={{ minHeight: `${minHeight}px` }}
    >
      <div className={styles.background} style={backgroundStyle} />
      <div className={styles.content}>
        {variant === "text" && content.type === "text" && (
          <BannerText
            title={content.title}
            excerpt={content.excerpt}
            linkText={content.linkText}
            linkUrl={content.linkUrl}
          />
        )}
        {variant === "booking" && content.type === "booking" && (
          <BannerBooking />
        )}
      </div>
    </section>
  );
};

