"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import { TourInfo } from "@/components/common/TourInfo";
import { formatDisplayDate } from "@/modules/booking/utils/dateUtils";
import { PricingBreakdown } from "./PricingBreakdown";
import styles from "../MiniCart.module.scss";

interface OrderSummaryProps {
  tourTitle: string;
  date: string;
  timeSlot: string;
  adults: number;
  childrenCount: number;
  subtotalAdults: number;
  subtotalChildren: number;
  total: number;
  currency: string;
}

/**
 * Componente OrderSummary para mostrar el resumen de la reserva
 */
export const OrderSummary: React.FC<OrderSummaryProps> = ({
  tourTitle,
  date,
  timeSlot,
  adults,
  childrenCount,
  subtotalAdults,
  subtotalChildren,
  total,
  currency,
}) => {
  return (
    <Card title="Resumen de la reserva">
      <div className={styles.orderSummary}>
        <TourInfo
          title={tourTitle}
          date={formatDisplayDate(date)}
          timeSlot={timeSlot}
          className={styles.tourInfo}
        />

        <PricingBreakdown
          adults={adults}
          childrenCount={childrenCount}
          subtotalAdults={subtotalAdults}
          subtotalChildren={subtotalChildren}
          total={total}
          currency={currency}
        />
      </div>
    </Card>
  );
};

