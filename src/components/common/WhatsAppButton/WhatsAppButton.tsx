"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import styles from "./WhatsAppButton.module.scss";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber,
  message = "Hola, me gustaría hacer una consulta",
}) => {
  // Formatear número (remover espacios, guiones, etc.)
  const formattedNumber = phoneNumber.replace(/\D/g, "");
  
  // Crear URL de WhatsApp
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label="Consultas por WhatsApp"
    >
      <span className={styles.text}>CONSULTAS POR WHATSAPP</span>
      <Icon name="whatsapp" size={24} className={styles.icon} />
    </Link>
  );
};

