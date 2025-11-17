"use client";

import React, { useState } from "react";
import styles from "./TourTimeline.module.scss";

export interface TimelineItem {
  id: string;
  timeLabel: string;
  title: string;
  description: string;
}

interface TourTimelineProps {
  /** Array de items del timeline */
  items: TimelineItem[];
  /** Nota importante opcional */
  importantNote?: string;
}

/**
 * Componente TourTimeline para mostrar el itinerario del tour con funcionalidad de acordeón
 */
export const TourTimeline: React.FC<TourTimelineProps> = ({ items, importantNote }) => {
  // Inicializar con todos los items expandidos por defecto
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(items.map((item) => item.id))
  );

  if (items.length === 0) {
    return null;
  }

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent, itemId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleItem(itemId);
    }
  };

  return (
    <section className={styles.timeline}>
      <div className={styles.container}>
        <h2 className={styles.title}>ITINERARIO DEL TOUR</h2>
        
        {importantNote && (
          <div className={styles.importantNote}>
            <strong>Importante:</strong> {importantNote}
          </div>
        )}
        
        <div className={styles.timelineList}>
          {items.map((item, index) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <div key={item.id} className={styles.timelineItem}>
                <div className={styles.timelineMarker} />
                <div className={styles.timelineContent}>
                  <button
                    className={styles.timeTitleRow}
                    onClick={() => toggleItem(item.id)}
                    onKeyDown={(e) => handleKeyDown(e, item.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`timeline-description-${item.id}`}
                    type="button"
                  >
                    <span className={styles.timeLabel}>{item.timeLabel}</span>
                    <span className={styles.itemTitle}> - {item.title}</span>
                  </button>
                  <div 
                    id={`timeline-description-${item.id}`}
                    className={`${styles.descriptionWrapper} ${isExpanded ? styles.expanded : styles.collapsed}`}
                    role="region"
                    aria-hidden={!isExpanded}
                  >
                    <p className={styles.itemDescription}>{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

