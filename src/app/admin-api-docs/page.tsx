/**
 * Swagger UI Page
 * Ruta: /admin-api-docs (solo desarrollo)
 * Documentación interna de la API - NO accesible públicamente
 */

"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function SwaggerDocsPage() {
  const [specUrl, setSpecUrl] = useState<string | null>(null);
  const [swaggerLoaded, setSwaggerLoaded] = useState(false);

  useEffect(() => {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === "production") {
      return;
    }

    // Obtener la URL base del servidor
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    setSpecUrl(`${baseUrl}/api/docs`);
  }, []);

  useEffect(() => {
    if (swaggerLoaded && specUrl && typeof window !== "undefined") {
      // Esperar un poco para asegurar que todos los scripts estén cargados
      setTimeout(() => {
        try {
          // @ts-ignore - SwaggerUIBundle está disponible globalmente después de cargar el script
          if ((window as any).SwaggerUIBundle) {
            const ui = (window as any).SwaggerUIBundle({
              url: specUrl,
              dom_id: "#swagger-ui",
              presets: [
                (window as any).SwaggerUIBundle.presets.apis,
                (window as any).SwaggerUIBundle.presets.standalone,
              ],
              deepLinking: true,
              displayRequestDuration: true,
              tryItOutEnabled: true,
              supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
            });
          }
        } catch (error) {
          console.error("Error initializing Swagger UI:", error);
        }
      }, 100);
    }
  }, [swaggerLoaded, specUrl]);

  // Bloquear en producción
  if (process.env.NODE_ENV === "production") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Acceso no autorizado</h1>
        <p>Esta página solo está disponible en modo desarrollo.</p>
      </div>
    );
  }

  if (!specUrl) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Loading Swagger Documentation...</h1>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <Script
        src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={() => setSwaggerLoaded(true)}
        onError={(e) => {
          console.error("Error loading Swagger UI bundle:", e);
        }}
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"
        strategy="afterInteractive"
        onError={(e) => {
          console.error("Error loading Swagger UI preset:", e);
        }}
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css"
      />
      <div id="swagger-ui" style={{ padding: "20px" }} />
    </div>
  );
}
