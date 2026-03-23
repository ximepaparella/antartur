"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import { formatArDate } from "@/lib/utils/dateTimeAr";
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
    fechaNacimiento?: string;
    documento?: string;
    direccion?: string;
    telefono?: string;
    esAdulto: boolean;
    embarazada?: boolean;
    problemasColumnaSalud?: boolean;
    restriccionesAlimentarias?: {
      vegetariano?: boolean;
      vegano?: boolean;
      celiaco?: boolean;
      alergias?: boolean;
      alergiasDetalle?: string;
    };
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
  const formattedDate = formatArDate(date, {
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
              {passengers.map((passenger, index) => {
                // Formatear fecha de nacimiento
                const formatDate = (dateStr?: string) => {
                  if (!dateStr) return null;
                  try {
                    return formatArDate(dateStr, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  } catch {
                    return dateStr;
                  }
                };

                // Formatear restricciones alimentarias
                const formatRestrictions = () => {
                  const restrictions: string[] = [];
                  if (passenger.restriccionesAlimentarias) {
                    const r = passenger.restriccionesAlimentarias;
                    if (r.vegetariano) restrictions.push("Vegetariano");
                    if (r.vegano) restrictions.push("Vegano");
                    if (r.celiaco) restrictions.push("Celíaco");
                    if (r.alergias) {
                      restrictions.push(
                        r.alergiasDetalle ? `Alergias: ${r.alergiasDetalle}` : "Alergias"
                      );
                    }
                  }
                  if (passenger.embarazada) restrictions.push("Embarazada");
                  if (passenger.problemasColumnaSalud) restrictions.push("Problemas de columna/salud");
                  return restrictions.length > 0 ? restrictions.join(", ") : null;
                };

                const restrictionsText = formatRestrictions();
                const birthDate = formatDate(passenger.fechaNacimiento);

                return (
                  <li key={index} className={styles.passengerItem}>
                    <div className={styles.passengerHeader}>
                      <strong>{passenger.nombreCompleto}</strong>
                      {passenger.esAdulto ? (
                        <span className={styles.passengerType}> (Adulto)</span>
                      ) : (
                        <span className={styles.passengerType}> (Menor)</span>
                      )}
                    </div>
                    <div className={styles.passengerDetails}>
                      {birthDate && (
                        <div className={styles.passengerDetail}>
                          <span className={styles.detailLabel}>Fecha de nacimiento:</span>
                          <span className={styles.detailValue}>{birthDate}</span>
                        </div>
                      )}
                      {passenger.documento && (
                        <div className={styles.passengerDetail}>
                          <span className={styles.detailLabel}>Documento:</span>
                          <span className={styles.detailValue}>{passenger.documento}</span>
                        </div>
                      )}
                      {passenger.direccion && (
                        <div className={styles.passengerDetail}>
                          <span className={styles.detailLabel}>Dirección:</span>
                          <span className={styles.detailValue}>{passenger.direccion}</span>
                        </div>
                      )}
                      {passenger.telefono && (
                        <div className={styles.passengerDetail}>
                          <span className={styles.detailLabel}>Teléfono:</span>
                          <span className={styles.detailValue}>{passenger.telefono}</span>
                        </div>
                      )}
                      {restrictionsText && (
                        <div className={styles.passengerDetail}>
                          <span className={styles.detailLabel}>Restricciones:</span>
                          <span className={styles.detailValue}>{restrictionsText}</span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

