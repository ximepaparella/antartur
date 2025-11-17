import React from "react";
import { Icon, IconName } from "@/components/common/Icon/Icon";
import styles from "./TourFeaturedInfo.module.scss";

export interface FeaturedInfoItem {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

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

