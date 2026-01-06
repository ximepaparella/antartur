"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/common/Button/Button";
import styles from "./CookieBanner.module.scss";

const COOKIE_NAME = "antartur_cookie_consent";
const COOKIE_VALUE = "accepted";
const COOKIE_EXPIRY_DAYS = 365;

/**
 * Función para establecer una cookie
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

/**
 * Función para obtener el valor de una cookie
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
}

/**
 * Componente CookieBanner - Banner de consentimiento de cookies GDPR
 * 
 * Muestra un banner flotante en la parte inferior de la página solicitando
 * consentimiento para el uso de cookies. Una vez aceptado, guarda una cookie
 * que previene que el banner se muestre nuevamente durante 1 año.
 */
export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar si la cookie ya existe
    const cookieValue = getCookie(COOKIE_NAME);
    
    // Solo mostrar el banner si no existe la cookie de consentimiento
    if (!cookieValue) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Guardar la cookie de consentimiento
    setCookie(COOKIE_NAME, COOKIE_VALUE, COOKIE_EXPIRY_DAYS);
    
    // Ocultar el banner
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.banner} role="banner" aria-label="Banner de consentimiento de cookies">
      <div className={styles.content}>
        <p className={styles.text}>
          Usamos cookies para mejorar tu experiencia de navegación. Al continuar navegando, aceptás el uso de cookies propias y de terceros para analizar el tráfico, personalizar contenido y mostrar publicidad relevante.
        </p>
        <Button
          variant="primary"
          onClick={handleAccept}
          className={styles.button}
          aria-label="Aceptar el uso de cookies"
        >
          Aceptar
        </Button>
      </div>
    </div>
  );
}

