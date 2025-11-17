"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import styles from "./Banner.module.scss";
import { BannerText } from "./BannerText";

interface BannerProps {
  /** URL de la imagen de fondo */
  backgroundImage: string;
  /** Título del banner */
  title: string;
  /** Extracto o descripción */
  excerpt: string;
  /** Texto del link */
  linkText: string;
  /** URL del link */
  linkUrl: string;
  /** Altura mínima del banner en píxeles (default: 500px) */
  minHeight?: number;
  /** Children opcional para contenido personalizado (ej: módulo de reservas) */
  children?: ReactNode;
}

/**
 * Componente Banner con efecto parallax
 * 
 * Muestra una card blanca con título, extracto y link.
 * También puede recibir children para contenido personalizado (ej: módulo de reservas).
 * 
 * @param backgroundImage - URL de la imagen de fondo
 * @param title - Título del banner
 * @param excerpt - Extracto o descripción
 * @param linkText - Texto del link
 * @param linkUrl - URL del link
 * @param minHeight - Altura mínima del banner (default: 500px)
 * @param children - Contenido opcional personalizado
 * 
 * @example
 * ```tsx
 * <Banner
 *   backgroundImage="/images/banner.jpg"
 *   title="Disfrutá desde otra mirada"
 *   excerpt="Conocé el fin del mundo..."
 *   linkText="Descubrí más"
 *   linkUrl="/verano"
 * />
 * ```
 */
export const Banner: React.FC<BannerProps> = ({
  backgroundImage,
  title,
  excerpt,
  linkText,
  linkUrl,
  minHeight = 500,
  children,
}) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calcular el efecto parallax basado en la posición del elemento
        // Reducimos el factor de parallax para que la imagen se mueva menos y cubra mejor
        if (rect.top < windowHeight && rect.bottom > 0) {
          const parallaxOffset = (rect.top - windowHeight / 2) * 0.3;
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
    minHeight: "100%",
  };

  return (
    <section
      ref={bannerRef}
      className={styles.banner}
      style={{ minHeight: `${minHeight}px` }}
    >
      <div className={styles.background} style={backgroundStyle} />
      <div className={styles.content}>
        {children ? (
          children
        ) : (
          <BannerText
            title={title}
            excerpt={excerpt}
            linkText={linkText}
            linkUrl={linkUrl}
          />
        )}
      </div>
    </section>
  );
};
