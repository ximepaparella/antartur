import React from "react";
import styles from "./TourInfo.module.scss";

interface TourInfoProps {
  /** Título de la sección */
  title: string;
  /** Párrafos de contenido */
  paragraphs: string[];
}

/**
 * Componente TourInfo para mostrar información descriptiva del tour
 */
export const TourInfo: React.FC<TourInfoProps> = ({ title, paragraphs }) => {
  return (
    <section className={styles.tourInfo}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.content}>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
};

