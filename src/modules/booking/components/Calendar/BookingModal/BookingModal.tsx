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
  infantsCount?: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onInfantsChange?: (value: number) => void;
  onClose: () => void;
  onBooking: () => void;
  exceedsAvailability: boolean;
  isClosing?: boolean;
  // Nuevos props
  additionals?: TourAdditional[];
  minAge?: number | null;
  minPassengers?: number | null;
  allowsInfants?: boolean;
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
  infantsCount = 0,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
  onClose,
  onBooking,
  exceedsAvailability,
  isClosing = false,
  additionals = [],
  minAge,
  minPassengers,
  allowsInfants: allowsInfantsProp,
  restrictionText,
  onAdditionalsChange,
}) => {
  const [selectedAdditionals, setSelectedAdditionals] = useState<SelectedAdditional[]>([]);
  const { currency } = useCurrency();

  // Actualizar additionals cuando cambia la moneda
  useEffect(() => {
    if (additionals && additionals.length > 0 && selectedAdditionals.length > 0) {
      // Crear un mapa de additionals por ID para acceso rápido
      const additionalsMap = new Map(additionals.map(a => [a.id, a]));
      
      // Actualizar cada additional seleccionado con el precio de la nueva moneda
      const updated = selectedAdditionals.map(selected => {
        const originalAdditional = additionalsMap.get(selected.additionalId);
        if (originalAdditional) {
          const prices = originalAdditional.prices[currency as "ARS" | "USD"];
          if (prices) {
            return {
              ...selected,
              priceAdult: prices.adult,
              priceChild: prices.child,
              currency,
            };
          }
        }
        return selected;
      }).filter(selected => {
        // Filtrar additionals que no tienen precio en la nueva moneda
        const originalAdditional = additionalsMap.get(selected.additionalId);
        return originalAdditional?.prices[currency as "ARS" | "USD"];
      });
      
      if (updated.length !== selectedAdditionals.length || 
          updated.some((u, i) => u.currency !== selectedAdditionals[i].currency || 
                                 u.priceAdult !== selectedAdditionals[i].priceAdult)) {
        setSelectedAdditionals(updated);
        if (onAdditionalsChange) {
          onAdditionalsChange(updated);
        }
      }
    }
  }, [currency, additionals, onAdditionalsChange]); // No incluir selectedAdditionals para evitar loops

  // Determinar si el tour acepta infantes
  // Priorizar el prop allowsInfants del tour, sino usar priceInfantFree del pricing
  // Pero NO permitir infantes si la edad mínima del tour es mayor a 3 años
  const allowsInfants = useMemo(() => {
    const baseAllowsInfants = allowsInfantsProp ?? pricing.priceInfantFree === true;
    // Si la edad mínima es mayor a 3, no permitir infantes (los infantes son 0-3 años)
    if (minAge && minAge > 3) {
      return false;
    }
    return baseAllowsInfants;
  }, [allowsInfantsProp, pricing.priceInfantFree, minAge]);

  // Validar mínimo de pasajeros (incluyendo infantes)
  const totalPassengers = adults + childrenCount + infantsCount;
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

  // Resetear infantsCount si el tour no permite infantes (por ejemplo, si minAge > 3)
  useEffect(() => {
    if (!allowsInfants && infantsCount > 0) {
      onInfantsChange?.(0);
    }
  }, [allowsInfants, infantsCount, onInfantsChange]);

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
        infantsCount={infantsCount}
        onAdultsChange={onAdultsChange}
        onChildrenChange={onChildrenChange}
        onInfantsChange={onInfantsChange}
        priceAdult={pricing.priceAdult}
        priceChild={pricing.priceChild}
        currency={pricing.currencyCode}
        childAgeRange={pricing.childAgeRange}
        description={pricing.childAgeRange ? `Rango de edad para menores: ${pricing.childAgeRange} años` : undefined}
        allowsChildren={allowsChildren}
        allowsInfants={allowsInfants}
        infantMaxAge={pricing.infantMaxAge}
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

