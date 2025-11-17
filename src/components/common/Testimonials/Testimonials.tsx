import React from "react";
import styles from "./Testimonials.module.scss";

export interface Testimonial {
  /** Texto del testimonio */
  text: string;
  /** Nombre del autor */
  author: string;
  /** URL o path de la imagen del avatar */
  avatar: string;
  /** País del autor */
  country: string;
}

interface TestimonialsProps {
  /** Array de testimonios */
  testimonials: Testimonial[];
  /** Variante de estilo: "light" (fondo blanco) o "dark" (fondo con gradiente) */
  variant?: "light" | "dark";
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials,
  variant = "light",
}) => {
  // Si solo hay un testimonio, no mostrar carousel
  const hasMultiple = testimonials.length > 1;

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section
      className={`${styles.testimonials} ${variant === "dark" ? styles.testimonialsDark : styles.testimonialsLight}`}
    >
      <div className={styles.container}>
        {hasMultiple ? (
          <div className={styles.carousel}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialItem}>
                <p className={styles.text}>{testimonial.text}</p>
                <div className={styles.authorInfo}>
                  <div className={styles.avatarWrapper}>
                    <img
                      src={testimonial.avatar}
                      alt={`${testimonial.author} avatar`}
                      className={styles.avatar}
                    />
                  </div>
                  <div className={styles.authorDetails}>
                    <p className={styles.authorName}>{testimonial.author}</p>
                    <p className={styles.country}>{testimonial.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.testimonialItem}>
            <p className={styles.text}>{testimonials[0].text}</p>
            <div className={styles.authorInfo}>
              <div className={styles.avatarWrapper}>
                <img
                  src={testimonials[0].avatar}
                  alt={`${testimonials[0].author} avatar`}
                  className={styles.avatar}
                />
              </div>
              <div className={styles.authorDetails}>
                <p className={styles.authorName}>{testimonials[0].author}</p>
                <p className={styles.country}>{testimonials[0].country}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

