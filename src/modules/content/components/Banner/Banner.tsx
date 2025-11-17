"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import styles from "./Banner.module.scss";

interface BannerProps {
  /** URL de la imagen de fondo */
  backgroundImage: string;
  /** Altura mínima del banner en píxeles (default: 500px) */
  minHeight?: number;
  /** Mostrar overlay oscuro sobre la imagen (default: false) */
  showOverlay?: boolean;
  /** Contenido del banner (BannerText, BannerBooking, etc.) */
  children: ReactNode;
}

/**
 * Componente Banner con efecto parallax
 * 
 * Contenedor base para banners con imagen de fondo y efecto parallax.
 * Siempre debe recibir children (BannerText, BannerBooking, etc.).
 * 
 * @param backgroundImage - URL de la imagen de fondo
 * @param minHeight - Altura mínima del banner (default: 500px)
 * @param showOverlay - Mostrar overlay oscuro sobre la imagen (default: false)
 * @param children - Contenido del banner (BannerText, BannerBooking, etc.)
 * 
 * @example
 * ```tsx
 * <Banner backgroundImage="/images/banner.jpg">
 *   <BannerText
 *     title="Disfrutá desde otra mirada"
 *     excerpt="Conocé el fin del mundo..."
 *     linkText="Descubrí más"
 *     linkUrl="/verano"
 *   />
 * </Banner>
 * ```
 */
export const Banner: React.FC<BannerProps> = ({
  backgroundImage,
  minHeight = 500,
  showOverlay = false,
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
    transform: `translateY(${scrollY}px)`,
  };

  return (
    <section
      ref={bannerRef}
      className={styles.banner}
      style={{ minHeight: `${minHeight}px` }}
    >
      <div className={styles.background} style={backgroundStyle} />
      {showOverlay && <div className={styles.overlay} />}
      <div className={styles.content}>
        {children}
      </div>
    </section>
  );
};
