import React from "react";
import Link from "next/link";
import styles from "./BannerText.module.scss";

interface BannerTextProps {
  /** Título del banner */
  title: string;
  /** Extracto o descripción */
  excerpt: string;
  /** Texto del link */
  linkText: string;
  /** URL del link */
  linkUrl: string;
}

/**
 * Módulo de texto para el Banner
 * 
 * Muestra una card blanca flotante con sombra que contiene:
 * - Título
 * - Extracto
 * - Link con texto personalizado
 * 
 * @example
 * ```tsx
 * <BannerText
 *   title="Disfrutá desde otra mirada"
 *   excerpt="Conocé el fin del mundo en todas sus temporadas..."
 *   linkText="DESCUBRÍ MÁS →"
 *   linkUrl="/ruta"
 * />
 * ```
 */
export const BannerText: React.FC<BannerTextProps> = ({
  title,
  excerpt,
  linkText,
  linkUrl,
}) => {
  return (
    <div className={styles.bannerText}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.excerpt}>{excerpt}</p>
      <Link href={linkUrl} className={styles.link}>
        {linkText}
      </Link>
    </div>
  );
};

