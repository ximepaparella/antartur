import React from "react";
import { Icon } from "@/components/icons/Icon";
import type { FeaturedInfoItem } from "@/modules/content/components/ToursGrid/tourTypes";
import styles from "./TourFeaturedInfo.module.scss";

// Re-exportar el tipo para conveniencia
export type { FeaturedInfoItem };

interface TourFeaturedInfoProps {
  /** Array de items de información destacada */
  items: FeaturedInfoItem[];
}

/**
 * Componente TourFeaturedInfo para mostrar información destacada del tour
 * con iconos, títulos y descripciones
 */
export const TourFeaturedInfo: React.FC<TourFeaturedInfoProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={styles.featuredInfo}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.iconWrapper}>
                <Icon name={item.icon} size={32} className={styles.icon} />
              </div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

