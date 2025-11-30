"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/common/Button/Button";
import { Message } from "@/components/common/Message";
import { Modal } from "@/components/common/Modal";
import type { Pricing, SelectedAdditional } from "@/lib/types/order";
import type { TourAdditional } from "@/modules/tours/types/tourTypes";
import { calculateOrderTotal, validateMinPassengers } from "@/lib/utils/pricing";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TourAdditionalsSelector } from "../../TourAdditionalsSelector";
import { BookingModalHeader } from "./BookingModalHeader";
import { PassengerInputs } from "./PassengerInputs";
import { BookingSummary } from "./BookingSummary";
import { useBookingMessages } from "./hooks/useBookingMessages";
import styles from "../Calendar.module.scss";

interface BookingModalProps {
  tourTitle: string;
  date: string;
  timeSlot: string;
  pricing: Pricing;
  adults: number;
  childrenCount: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onClose: () => void;
  onBooking: () => void;
  exceedsAvailability: boolean;
  isClosing?: boolean;
  // Nuevos props
  additionals?: TourAdditional[];
  minAge?: number | null;
  minPassengers?: number | null;
  restrictionText?: string | null;
  onAdditionalsChange?: (additionals: SelectedAdditional[]) => void;
}

/**
 * Componente BookingModal para el modal de reserva
 */
export const BookingModal: React.FC<BookingModalProps> = ({
  tourTitle,
  date,
  timeSlot,
  pricing,
  adults,
  childrenCount,
  onAdultsChange,
  onChildrenChange,
  onClose,
  onBooking,
  exceedsAvailability,
  isClosing = false,
  additionals = [],
  minAge,
  minPassengers,
  restrictionText,
  onAdditionalsChange,
}) => {
  const [selectedAdditionals, setSelectedAdditionals] = useState<SelectedAdditional[]>([]);
  const { currency } = useCurrency();

  // Validar mínimo de pasajeros
  const totalPassengers = adults + childrenCount;
  const violatesMinPassengers = useMemo(() => {
    return !validateMinPassengers(totalPassengers, minPassengers);
  }, [totalPassengers, minPassengers]);

  // Obtener todos los mensajes usando el hook
  const messages = useBookingMessages({
    restrictionText,
    minAge,
    minPassengers,
    totalPassengers,
    exceedsAvailability,
  });

  // Determinar si el tour permite menores
  // Si minAge >= 15, solo permite adultos (no menores)
  // También verificar si hay precio para menores configurado
  const allowsChildren = useMemo(() => {
    if (minAge && minAge >= 15) {
      return false; // Edad mínima de 15+ significa solo adultos
    }
    // Si hay childAgeRange configurado, permite menores
    if (pricing.childAgeRange) {
      return true;
    }
    // Si hay precio para menores > 0, permite menores
    return pricing.priceChild > 0;
  }, [minAge, pricing.childAgeRange, pricing.priceChild]);

  // Resetear childrenCount si el tour no permite menores
  useEffect(() => {
    if (!allowsChildren && childrenCount > 0) {
      onChildrenChange(0);
    }
  }, [allowsChildren, childrenCount, onChildrenChange]);

  // Calcular total incluyendo additionals
  const subtotal = useMemo(() => {
    return calculateOrderTotal(adults, childrenCount, pricing, selectedAdditionals);
  }, [adults, childrenCount, pricing, selectedAdditionals]);

  const handleAdditionalsChange = (newAdditionals: SelectedAdditional[]) => {
    setSelectedAdditionals(newAdditionals);
    if (onAdditionalsChange) {
      onAdditionalsChange(newAdditionals);
    }
  };

  const handleBooking = () => {
    // Validar mínimo de pasajeros antes de proceder
    if (violatesMinPassengers) {
      return;
    }
    onBooking();
  };

  return (
    <Modal
      isOpen={true}
      isClosing={isClosing}
      title="REALIZAR UNA RESERVA"
      size="medium"
      onClose={onClose}
    >
      <BookingModalHeader
        tourTitle={tourTitle}
        date={date}
        timeSlot={timeSlot}
      />

      {/* Mensajes informativos y de validación unificados */}
      {messages.length > 0 && (
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <Message key={message.id} variant={message.variant}>
              {message.content}
            </Message>
          ))}
        </div>
      )}

      <PassengerInputs
        adults={adults}
        childrenCount={childrenCount}
        onAdultsChange={onAdultsChange}
        onChildrenChange={onChildrenChange}
        priceAdult={pricing.priceAdult}
        priceChild={pricing.priceChild}
        currency={pricing.currencyCode}
        childAgeRange={pricing.childAgeRange}
        description={pricing.childAgeRange ? `Rango de edad para menores: ${pricing.childAgeRange} años` : undefined}
        allowsChildren={allowsChildren}
      />

      {/* Selector de additionals */}
      {additionals && additionals.length > 0 && (
        <TourAdditionalsSelector
          additionals={additionals}
          selectedAdditionals={selectedAdditionals}
          onSelectionChange={handleAdditionalsChange}
          currency={currency}
        />
      )}

      <BookingSummary
        subtotal={subtotal}
        currency={pricing.currencyCode}
      />

      <div className={styles.modalActions}>
        <Button
          variant="primary"
          onClick={handleBooking}
          disabled={violatesMinPassengers || exceedsAvailability}
        >
          Realizar una reserva
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancelar Reserva
        </Button>
      </div>
    </Modal>
  );
};

