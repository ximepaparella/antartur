import React from "react";
import { Button } from "@/components/common/Button/Button";
import { Icon, IconName } from "@/components/icons/Icon";
import styles from "./TourQuickInfo.module.scss";

export interface QuickInfoItem {
  id: string;
  label: string;
  value: string;
  icon: IconName;
}

interface TourQuickInfoProps {
  /** Precio del tour */
  price: string;
  /** Items de información rápida (duración, dificultad, etc.) */
  items: QuickInfoItem[];
  /** Restricción o advertencia opcional */
  restriction?: string;
  /** Alternativa opcional (otro tour relacionado) */
  alternative?: {
    text: string;
    price: string;
  };
  /** Texto del CTA de reserva */
  ctaLabel: string;
  /** URL del CTA de reserva */
  ctaHref: string;
}

/**
 * Componente QuickInfo para tours
 * Muestra precio, items de información y CTA de reserva en un fondo primary
 */
export const TourQuickInfo: React.FC<TourQuickInfoProps> = ({
  price,
  items,
  restriction,
  alternative,
  ctaLabel,
  ctaHref,
}) => {
  return (
    <section className={styles.quickInfo} id="quick-info">
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.topSection}>
            <div className={styles.priceColumn}>
              <div className={styles.priceLabel}>Precio</div>
              <div className={styles.priceValue}>{price}</div>
            </div>
            
            <div className={styles.ctaColumn}>
              <Button variant="tertiary" href={ctaHref} size="large">
                {ctaLabel}
              </Button>
            </div>
          </div>
          
          <ul className={styles.itemsColumn}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <Icon name={item.icon} size={24} className={styles.icon} />
                <div className={styles.itemContent}>
                  {item.label && <span className={styles.itemLabel}>{item.label}</span>}
                  <span className={styles.itemValue}>{item.value}</span>
                </div>
              </li>
            ))}
            {restriction && (
              <li className={`${styles.item} ${styles.itemFullWidth}`}>
                <Icon name="info" size={24} className={styles.icon} />
                <div className={styles.itemContent}>
                  <span className={styles.itemValue}>{restriction}</span>
                </div>
              </li>
            )}
            {alternative && (
              <li className={styles.item}>
                <Icon name="map-route" size={24} className={styles.icon} />
                <div className={`${styles.itemContent} ${styles.itemContentRow}`}>
                  <span className={styles.itemValue}>{alternative.text}</span>
                  <span className={styles.itemValue}>{alternative.price}</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};

