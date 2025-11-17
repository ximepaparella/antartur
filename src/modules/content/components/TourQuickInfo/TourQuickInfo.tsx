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
      <div className={styles.container}>
        <div className={styles.priceColumn}>
          <div className={styles.priceLabel}>Precio</div>
          <div className={styles.priceValue}>{price}</div>
        </div>
        
        <div className={styles.itemsColumn}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <Icon name={item.icon} size={24} className={styles.icon} />
              <div className={styles.itemContent}>
                {item.label && <span className={styles.itemLabel}>{item.label}</span>}
                <span className={styles.itemValue}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.ctaColumn}>
          <Button variant="tertiary" href={ctaHref} size="large">
            {ctaLabel}
          </Button>
        </div>
      </div>
      
      {restriction && (
        <div className={styles.restriction}>
          <Icon name="info" size={20} className={styles.restrictionIcon} />
          <span className={styles.restrictionText}>{restriction}</span>
        </div>
      )}
      
      {alternative && (
        <div className={styles.alternative}>
          <Icon name="map-route" size={20} className={styles.alternativeIcon} />
          <span className={styles.alternativeText}>{alternative.text}</span>
          <span className={styles.alternativePrice}>{alternative.price}</span>
        </div>
      )}
    </section>
  );
};

