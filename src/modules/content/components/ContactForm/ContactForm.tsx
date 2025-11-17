"use client";

import React, { useState } from "react";
// import ReCAPTCHA from "react-google-recaptcha"; // Commented out for localhost development
import { Button } from "@/components/common/Button/Button";
import styles from "./ContactForm.module.scss";

interface ContactFormData {
  nombreCompleto: string;
  apellidos: string;
  email: string;
  codigoPais: string;
  codigoCiudad: string;
  celular: string;
  codigoReserva: string;
  mensaje: string;
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    nombreCompleto: "",
    apellidos: "",
    email: "",
    codigoPais: "",
    codigoCiudad: "",
    celular: "",
    codigoReserva: "",
    mensaje: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  // const recaptchaRef = useRef<ReCAPTCHA>(null); // Commented out for localhost development

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

    // Validar reCAPTCHA - Commented out for localhost development
    // const recaptchaToken = recaptchaRef.current?.getValue();
    // if (!recaptchaToken) {
    //   setSubmitStatus({
    //     type: "error",
    //     message: "Por favor, completa el reCAPTCHA",
    //   });
    //   setIsSubmitting(false);
    //   return;
    // }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          // recaptchaToken, // Commented out for localhost development
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "¡Consulta enviada exitosamente! Te responderemos a la brevedad.",
        });
        // Resetear formulario
        setFormData({
          nombreCompleto: "",
          apellidos: "",
          email: "",
          codigoPais: "",
          codigoCiudad: "",
          celular: "",
          codigoReserva: "",
          mensaje: "",
        });
        // Resetear reCAPTCHA - Commented out for localhost development
        // recaptchaRef.current?.reset();
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Error al enviar la consulta. Por favor, intentá nuevamente.",
        });
        // recaptchaRef.current?.reset(); // Commented out for localhost development
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Error de conexión. Por favor, intentá nuevamente más tarde.",
      });
      // recaptchaRef.current?.reset(); // Commented out for localhost development
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactForm}>
      <h2 className={styles.title}>¡ENVIANOS TU CONSULTA!</h2>
      <p className={styles.description}>
        Podes enviarnos tus consultas a través de nuestro formulario de contacto, y te responderemos a la brevedad. También podes contactarnos vía Whatsapp o a través de nuestras redes sociales!
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
          <label htmlFor="nombreCompleto" className={styles.label}>
            Nombre Completo: <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="nombreCompleto"
            name="nombreCompleto"
            value={formData.nombreCompleto}
            onChange={handleChange}
            placeholder="Ingrese su nombre completo"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="apellidos" className={styles.label}>
            Apellidos: <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="apellidos"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            placeholder="Ingrese sus apellidos"
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
            placeholder="Ingrese su Email"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="codigoPais" className={styles.label}>
              Código de país: <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="codigoPais"
              name="codigoPais"
              value={formData.codigoPais}
              onChange={handleChange}
              placeholder="Ingrese su código de país"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="codigoCiudad" className={styles.label}>
              Código de Ciudad:
            </label>
            <input
              type="text"
              id="codigoCiudad"
              name="codigoCiudad"
              value={formData.codigoCiudad}
              onChange={handleChange}
              placeholder="Ingrese el código de su ciudad"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="celular" className={styles.label}>
            Celular/Móvil: <span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            id="celular"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            placeholder="Ingrese su número de Celular / Móvil"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="codigoReserva" className={styles.label}>
            ¿Ya tiene una reserva?
          </label>
          <input
            type="text"
            id="codigoReserva"
            name="codigoReserva"
            value={formData.codigoReserva}
            onChange={handleChange}
            placeholder="Ingrese su código de Reserva"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="mensaje" className={styles.label}>
            Mensaje o Consulta: <span className={styles.required}>*</span>
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            placeholder="Escriba aquí su consulta"
            className={styles.textarea}
            rows={5}
            required
          />
        </div>

        {/* reCAPTCHA commented out for localhost development */}
        {/* <div className={styles.recaptchaContainer}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
            theme="light"
          />
        </div> */}

        <Button
          type="submit"
          variant="primary"
          size="small"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? "ENVIANDO..." : "ENVIAR CONSULTA"}
        </Button>
      </form>
    </div>
  );
};

