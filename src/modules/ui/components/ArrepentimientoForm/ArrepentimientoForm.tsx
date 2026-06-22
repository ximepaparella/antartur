"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import styles from "../ContactForm/ContactForm.module.scss";

interface ArrepentimientoFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  codigoReserva: string;
  comentarios: string;
}

export const ArrepentimientoForm: React.FC = () => {
  const [formData, setFormData] = useState<ArrepentimientoFormData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    codigoReserva: "",
    comentarios: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/arrepentimiento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message:
            "¡Solicitud enviada exitosamente! Nos pondremos en contacto a la brevedad.",
        });
        setFormData({
          nombre: "",
          apellido: "",
          email: "",
          telefono: "",
          codigoReserva: "",
          comentarios: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message:
            data.error ||
            "Error al enviar la solicitud. Por favor, intentá nuevamente.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message:
          "Error de conexión. Por favor, intentá nuevamente más tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactForm}>
      <h2 className={styles.title}>BOTÓN DE ARREPENTIMIENTO</h2>
      <p className={styles.description}>
        De acuerdo con la normativa vigente, podés ejercer tu derecho de
        arrepentimiento completando el siguiente formulario. Procesaremos tu
        solicitud y nos comunicaremos contigo a la brevedad.
      </p>

      {submitStatus.type && (
        <div
          className={`${styles.statusMessage} ${
            submitStatus.type === "success" ? styles.success : styles.error
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="nombre" className={styles.label}>
            Nombre: <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingrese su nombre"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="apellido" className={styles.label}>
            Apellido: <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ingrese su apellido"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email: <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingrese su email"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="telefono" className={styles.label}>
            Teléfono: <span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ingrese su número de teléfono"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="codigoReserva" className={styles.label}>
            Código de Reserva: <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="codigoReserva"
            name="codigoReserva"
            value={formData.codigoReserva}
            onChange={handleChange}
            placeholder="Ingrese su código de reserva"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="comentarios" className={styles.label}>
            Comentarios: <span className={styles.required}>*</span>
          </label>
          <textarea
            id="comentarios"
            name="comentarios"
            value={formData.comentarios}
            onChange={handleChange}
            placeholder="Escriba aquí sus comentarios"
            className={styles.textarea}
            rows={5}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="small"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? "ENVIANDO..." : "ENVIAR SOLICITUD"}
        </Button>
      </form>
    </div>
  );
};
