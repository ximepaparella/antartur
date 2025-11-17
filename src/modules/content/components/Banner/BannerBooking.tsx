"use client";

import React from "react";
import styles from "./BannerBooking.module.scss";
import { Icon } from "@/components/common/Icon/Icon";

/**
 * Módulo de reservas para el Banner
 * 
 * Muestra un módulo a 2 columnas:
 * - Izquierda: Pasos del proceso de reserva (4 pasos)
 * - Derecha: Calendario de booking (placeholder por ahora)
 * 
 * @example
 * ```tsx
 * <BannerBooking />
 * ```
 */
export const BannerBooking: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: "Seleccioná la fecha",
      icon: "calendar" as const,
      completed: true,
    },
    {
      id: 2,
      title: "Seleccioná la cantidad de pasajeros (Adultos y niños)",
      icon: "users" as const,
      completed: false,
    },
    {
      id: 3,
      title: "Completá los datos de la reserva",
      icon: "info" as const,
      completed: false,
    },
    {
      id: 4,
      title: "Aboná online con múltiples medios de pago",
      icon: "credit-card" as const,
      completed: false,
    },
  ];

  return (
    <div className={styles.bannerBooking}>
      <div className={styles.leftColumn}>
        <h2 className={styles.title}>¡Hacé tu reserva!</h2>
        <ul className={styles.stepsList}>
          {steps.map((step) => (
            <li
              key={step.id}
              className={`${styles.step} ${step.completed ? styles.stepCompleted : ""}`}
            >
              <div className={styles.stepIcon}>
                {step.completed ? (
                  <Icon name="check" size={24} ariaLabel="" />
                ) : (
                  <Icon name={step.icon} size={24} ariaLabel="" />
                )}
              </div>
              <span className={styles.stepText}>{step.title}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.rightColumn}>
        <div className={styles.calendarPlaceholder}>
          <p className={styles.placeholderText}>
            Calendario de booking
            <br />
            <span className={styles.placeholderSubtext}>
              (Próximamente)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

