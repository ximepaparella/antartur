"use client";

import React, { useEffect, useState } from "react";
import { generateReservationEmailHTML } from "@/modules/notifications/templates/reservationEmail";
import { generateEnquiryEmailHTML } from "@/modules/notifications/templates/enquiryEmail";
import { Button } from "@/components/common/Button/Button";
import styles from "./page.module.scss";

type TemplateType = "reservation" | "enquiry";

export default function EmailPreviewPage() {
  const [template, setTemplate] = useState<TemplateType>("reservation");
  const [html, setHtml] = useState<string>("");
  const [showRawHtml, setShowRawHtml] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // Verificar que estamos en desarrollo
    setIsDevelopment(process.env.NODE_ENV !== "production");
  }, []);

  useEffect(() => {
    if (!isDevelopment) return;

    if (template === "reservation") {
      const data = {
        orderCode: "RES-2024-001",
        status: "PENDING_PAYMENT",
        customerName: "Juan Pérez",
        tourName: "Experiencia Antártica",
        departureDate: "15 de marzo de 2024",
        startTime: "08:00",
        numAdults: 2,
        numChildren: 1,
        totalAmount: 150000,
        currency: "ARS",
        isBankTransfer: true,
        bankDetails: {
          accountName: "Gustavo Adolfo Francisco Giro",
          accountNumber: "6893238937",
          bank: "HSBC",
          cuit: "20-20453913-9",
          cbu: "1500689100068932389378",
          alias: "Antartur",
        },
        passengers: [
          { firstName: "Juan", lastName: "Pérez", type: "ADULT" },
          { firstName: "María", lastName: "Pérez", type: "ADULT" },
          { firstName: "Pedro", lastName: "Pérez", type: "CHILD" },
        ],
        additionals: [{ name: "Con Canoas" }],
      };
      setHtml(generateReservationEmailHTML(data));
    } else {
      const data = {
        orderCode: "ENQ-2024-001",
        status: "PENDING_PAYMENT",
        customerName: "Ana García",
        customerEmail: "ana.garcia@example.com",
        customerPhone: "+54 9 2901 123456",
        tourName: "Trekking Glaciar Ojo de Albino",
        departureDate: "20 de marzo de 2024",
        startTime: "09:00",
        numAdults: 3,
        numChildren: 0,
        totalAmount: 120000,
        currency: "ARS",
        reason: "exceedsAvailability",
        passengers: [
          { firstName: "Ana", lastName: "García", type: "ADULT" },
          { firstName: "Carlos", lastName: "García", type: "ADULT" },
          { firstName: "Luis", lastName: "García", type: "ADULT" },
        ],
      };
      setHtml(generateEnquiryEmailHTML(data));
    }
  }, [template, isDevelopment]);

  // Bloquear en producción
  if (!isDevelopment) {
    return (
      <div className={styles.errorContainer}>
        <h1>Acceso no autorizado</h1>
        <p>Esta página solo está disponible en modo desarrollo.</p>
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(html);
    alert("HTML copiado al portapapeles");
  };

  return (
    <div className={styles.previewPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Email Templates Preview</h1>
        <p className={styles.subtitle}>
          Visualiza las plantillas de email HTML para reservas y consultas
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.templateSelector}>
          <Button
            variant={template === "reservation" ? "primary" : "outline"}
            onClick={() => setTemplate("reservation")}
          >
            Reserva Confirmada
          </Button>
          <Button
            variant={template === "enquiry" ? "primary" : "outline"}
            onClick={() => setTemplate("enquiry")}
          >
            Consulta Recibida
          </Button>
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={() => setShowRawHtml(!showRawHtml)}
          >
            {showRawHtml ? "Ver Preview" : "Ver HTML Raw"}
          </Button>
          <Button variant="outline" onClick={copyToClipboard}>
            Copiar HTML
          </Button>
        </div>
      </div>

      <div className={styles.previewContainer}>
        {showRawHtml ? (
          <pre className={styles.rawHtml}>
            <code>{html}</code>
          </pre>
        ) : (
          <iframe
            srcDoc={html}
            className={styles.emailFrame}
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        )}
      </div>

      <div className={styles.info}>
        <p>
          <strong>Nota:</strong> Los datos mostrados son de ejemplo. El logo y las imágenes
          se cargarán desde la URL base del sitio configurada en las variables de entorno.
        </p>
      </div>
    </div>
  );
}

