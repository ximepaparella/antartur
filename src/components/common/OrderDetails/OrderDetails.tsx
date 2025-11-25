"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import styles from "./OrderDetails.module.scss";

interface OrderDetailsProps {
  tourTitle: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  adults: number;
  numChildren: number;
  passengers: Array<{
    nombreCompleto: string;
    esAdulto: boolean;
  }>;
}

/**
 * Componente para mostrar el detalle de una orden/reserva
 */
export const OrderDetails: React.FC<OrderDetailsProps> = ({
  tourTitle,
  date,
  timeSlot,
  adults,
  numChildren,
  passengers,
}) => {
  // Formatear fecha
  const formattedDate = new Date(date).toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Formatear hora
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  const totalPassengers = adults + numChildren;

  return (
    <Card className={styles.orderDetailsCard}>
      <h3 className={styles.title}>Detalle de la Reserva</h3>
      
      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Excursión:</span>
          <span className={styles.value}>{tourTitle}</span>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.label}>Fecha:</span>
          <span className={styles.value}>{formattedDate}</span>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.label}>Horario:</span>
          <span className={styles.value}>
            {formatTime(timeSlot.start)} – {formatTime(timeSlot.end)}
          </span>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.label}>Pasajeros:</span>
          <span className={styles.value}>
            {totalPassengers} {totalPassengers === 1 ? "pasajero" : "pasajeros"}
            {adults > 0 && numChildren > 0 && ` (${adults} ${adults === 1 ? "adulto" : "adultos"}, ${numChildren} ${numChildren === 1 ? "menor" : "menores"})`}
            {adults > 0 && numChildren === 0 && ` (${adults} ${adults === 1 ? "adulto" : "adultos"})`}
            {adults === 0 && numChildren > 0 && ` (${numChildren} ${numChildren === 1 ? "menor" : "menores"})`}
          </span>
        </div>
        
        {passengers.length > 0 && (
          <div className={styles.passengersSection}>
            <span className={styles.label}>Lista de pasajeros:</span>
            <ul className={styles.passengersList}>
              {passengers.map((passenger, index) => (
                <li key={index} className={styles.passengerItem}>
                  {passenger.nombreCompleto}
                  {passenger.esAdulto ? (
                    <span className={styles.passengerType}> (Adulto)</span>
                  ) : (
                    <span className={styles.passengerType}> (Menor)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

