import React from "react";
import Image from "next/image";
import styles from "./Testimonials.module.scss";
import type { Testimonial } from "@/modules/content/components/Testimonials/types";

// Re-exportar para compatibilidad
export type { Testimonial };

interface TestimonialsProps {
  /** Array de testimonios */
  testimonials: Testimonial[];
  /** Variante de estilo: "light" (fondo blanco) o "dark" (fondo con gradiente) */
  variant?: "light" | "dark";
}

/**
 * Componente Testimonials para mostrar testimonios de clientes
 * 
 * Soporta dos variantes de estilo:
 * - `light`: Fondo blanco con texto gris oscuro
 * - `dark`: Fondo con gradiente y texto blanco
 * 
 * Si hay múltiples testimonios, muestra un carousel (a implementar).
 * Si hay un solo testimonio, lo muestra directamente sin carousel.
 * 
 * @param testimonials - Array de testimonios a mostrar
 * @param variant - Variante de estilo: "light" o "dark" (default: "light")
 * 
 * @example
 * ```tsx
 * <Testimonials 
 *   testimonials={testimonialsData.home} 
 *   variant="light" 
 * />
 * ```
 */
export const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials,
  variant = "light",
}) => {
  if (testimonials.length === 0) {
    return null;
  }

  // Renderizar testimonio único o múltiples
  const renderTestimonial = (testimonial: Testimonial, index: number) => (
    <div key={index} className={styles.testimonialItem}>
      <p className={styles.text}>{testimonial.text}</p>
      <div className={styles.authorInfo}>
        <div className={styles.avatarWrapper}>
          <Image
            src={testimonial.avatar}
            alt={`${testimonial.author} avatar`}
            width={80}
            height={80}
            className={styles.avatar}
          />
        </div>
        <div className={styles.authorDetails}>
          <p className={styles.authorName}>{testimonial.author}</p>
          <p className={styles.country}>{testimonial.country}</p>
        </div>
      </div>
    </div>
  );

  const hasMultiple = testimonials.length > 1;

  return (
    <section
      className={`${styles.testimonials} ${variant === "dark" ? styles.testimonialsDark : styles.testimonialsLight}`}
    >
      <div className={styles.container}>
        {hasMultiple ? (
          <div className={styles.carousel}>
            {testimonials.map(renderTestimonial)}
          </div>
        ) : (
          renderTestimonial(testimonials[0], 0)
        )}
      </div>
    </section>
  );
};

