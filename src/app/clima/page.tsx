import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { WindyWidgetClient } from "@/modules/ui/components/WindyWidget/WindyWidgetClient";

export const metadata: Metadata = {
  title: "Clima - Información del Clima en Ushuaia | Antartur",
  description: "Conocé el clima de los próximos días en Ushuaia. Información actualizada del clima y condiciones meteorológicas en Tierra del Fuego.",
  keywords: ["clima", "Ushuaia", "tiempo", "meteorología", "Tierra del Fuego", "pronóstico"],
  openGraph: {
    title: "Clima - Información del Clima en Ushuaia | Antartur",
    description: "Conocé el clima de los próximos días en Ushuaia. Información actualizada del clima y condiciones meteorológicas.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "Clima - Información del Clima en Ushuaia | Antartur",
    description: "Conocé el clima de los próximos días en Ushuaia.",
  },
};

export default function ClimaPage() {
  return (
    <>
      <Hero variant="internal" pageKey="clima" />
      <main style={{ margin: 0, padding: 0, width: "100%" }}>
        <WindyWidgetClient />
      </main>
    </>
  );
}
