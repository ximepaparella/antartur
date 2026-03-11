"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Message } from "@/components/common/Message";
import { createAuthHeaders } from "@/modules/admin/lib/authHelpers";
import styles from "./page.module.scss";

type HomePrimarySeason = "SUMMER" | "WINTER" | "AUTO";

interface SiteSettingsFormState {
  homePrimarySeason: HomePrimarySeason;
  gtmId: string;
  ga4Id: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  country: string;
  facebookUrl: string;
  instagramUrl: string;
  whatsappUrl: string;
}

const DEFAULT_FORM_STATE: SiteSettingsFormState = {
  homePrimarySeason: "SUMMER",
  gtmId: "",
  ga4Id: "",
  phone: "",
  whatsappNumber: "",
  email: "",
  address: "",
  city: "",
  country: "",
  facebookUrl: "",
  instagramUrl: "",
  whatsappUrl: "",
};

export default function SiteSettingsPage() {
  const [form, setForm] = useState<SiteSettingsFormState>(DEFAULT_FORM_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/settings/site", {
        headers: createAuthHeaders({ "Content-Type": "application/json" }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Site settings API error:", response.status, text);
        throw new Error("Error al cargar la configuración del sitio");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.detail || "Error al cargar la configuración del sitio");
      }

      const settings = data.data as any;

      setForm({
        homePrimarySeason: settings.homePrimarySeason ?? "SUMMER",
        gtmId: settings.gtmId ?? "",
        ga4Id: settings.ga4Id ?? "",
        phone: settings.phone ?? "",
        whatsappNumber: settings.whatsappNumber ?? "",
        email: settings.email ?? "",
        address: settings.address ?? "",
        city: settings.city ?? "",
        country: settings.country ?? "",
        facebookUrl: settings.facebookUrl ?? "",
        instagramUrl: settings.instagramUrl ?? "",
        whatsappUrl: settings.whatsappUrl ?? "",
      });
    } catch (err: any) {
      console.error("Error loading site settings:", err);
      setError(err.message || "Error al cargar la configuración del sitio");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange =
    (field: keyof SiteSettingsFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {};

      (Object.keys(form) as (keyof SiteSettingsFormState)[]).forEach((key) => {
        const value = form[key];
        // Enviar undefined para campos vacíos opcionales
        body[key] = value === "" ? undefined : value;
      });

      const response = await fetch("/api/admin/settings/site", {
        method: "PATCH",
        headers: createAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const backendError =
          (typeof data.error === "string" ? data.error : data.error?.detail) ||
          "Error al guardar la configuración";
        throw new Error(backendError);
      }

      setSuccessMessage("Configuración guardada correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error saving site settings:", err);
      setError(err.message || "Error al guardar la configuración");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Cargando configuración del sitio...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configuración general</h1>
        <p className={styles.subtitle}>
          Define el orden de la home y los datos de contacto y redes que se muestran en el sitio
          público.
        </p>
      </div>

      {error && (
        <div className={styles.messageWrapper}>
          <Message variant="alert">{error}</Message>
          <button
            className={styles.dismissButton}
            onClick={() => setError(null)}
            aria-label="Cerrar mensaje de error"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className={styles.messageWrapper}>
          <Message variant="success">{successMessage}</Message>
          <button
            className={styles.dismissButton}
            onClick={() => setSuccessMessage(null)}
            aria-label="Cerrar mensaje de éxito"
          >
            ×
          </button>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Home</h2>
          <p className={styles.sectionDescription}>
            Elegí qué tipo de excursiones se muestran primero en la página principal.
          </p>

          <div className={styles.fieldGroup}>
            <label htmlFor="homePrimarySeason" className={styles.label}>
              Orden de la home
            </label>
            <select
              id="homePrimarySeason"
              name="homePrimarySeason"
              className={styles.select}
              value={form.homePrimarySeason}
              onChange={handleChange("homePrimarySeason")}
            >
              <option value="SUMMER">Verano primero, luego Invierno</option>
              <option value="WINTER">Invierno primero, luego Verano</option>
              <option value="AUTO">Automático (según temporada)</option>
            </select>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Analytics</h2>
          <p className={styles.sectionDescription}>
            Configurá los IDs de Google Tag Manager y Google Analytics 4. Si no se completan, se
            usarán los valores definidos en las variables de entorno.
          </p>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="gtmId" className={styles.label}>
                Google Tag Manager ID
              </label>
              <input
                id="gtmId"
                type="text"
                className={styles.input}
                value={form.gtmId}
                onChange={handleChange("gtmId")}
                placeholder="ej: GTM-XXXXXXX"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="ga4Id" className={styles.label}>
                Google Analytics 4 ID
              </label>
              <input
                id="ga4Id"
                type="text"
                className={styles.input}
                value={form.ga4Id}
                onChange={handleChange("ga4Id")}
                placeholder="ej: G-XXXXXXXXXX"
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Datos de contacto</h2>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>
                Email principal
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={form.email}
                onChange={handleChange("email")}
                placeholder="ej: agencias@antartur.tur.ar"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="phone" className={styles.label}>
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                className={styles.input}
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="ej: +54 9 2901 48-7838"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="whatsappNumber" className={styles.label}>
                Número de WhatsApp
              </label>
              <input
                id="whatsappNumber"
                type="tel"
                className={styles.input}
                value={form.whatsappNumber}
                onChange={handleChange("whatsappNumber")}
                placeholder="ej: +54 9 2901 48-7838"
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="address" className={styles.label}>
                Dirección
              </label>
              <input
                id="address"
                type="text"
                className={styles.input}
                value={form.address}
                onChange={handleChange("address")}
                placeholder="ej: Juan Manuel de Rosas 184"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="city" className={styles.label}>
                Ciudad
              </label>
              <input
                id="city"
                type="text"
                className={styles.input}
                value={form.city}
                onChange={handleChange("city")}
                placeholder="ej: Ushuaia"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="country" className={styles.label}>
                País
              </label>
              <input
                id="country"
                type="text"
                className={styles.input}
                value={form.country}
                onChange={handleChange("country")}
                placeholder="ej: Argentina"
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Redes sociales</h2>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="facebookUrl" className={styles.label}>
                Facebook
              </label>
              <input
                id="facebookUrl"
                type="url"
                className={styles.input}
                value={form.facebookUrl}
                onChange={handleChange("facebookUrl")}
                placeholder="https://www.facebook.com/antartur"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="instagramUrl" className={styles.label}>
                Instagram
              </label>
              <input
                id="instagramUrl"
                type="url"
                className={styles.input}
                value={form.instagramUrl}
                onChange={handleChange("instagramUrl")}
                placeholder="https://www.instagram.com/antartur"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="whatsappUrl" className={styles.label}>
                Link directo de WhatsApp
              </label>
              <input
                id="whatsappUrl"
                type="url"
                className={styles.input}
                value={form.whatsappUrl}
                onChange={handleChange("whatsappUrl")}
                placeholder="https://wa.me/..."
              />
            </div>
          </div>
        </section>

        <div className={styles.footer}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

