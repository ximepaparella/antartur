import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";

export const metadata: Metadata = {
  title: "Ushuaia - La Ciudad Más Austral del Mundo | Antartur",
  description: "Ushuaia, la ciudad más austral del mundo. Información sobre turismo, excursiones, hoteles y gastronomía en Ushuaia, Tierra del Fuego.",
  keywords: ["Ushuaia", "ciudad más austral", "Tierra del Fuego", "turismo Ushuaia", "Fin del Mundo"],
  openGraph: {
    title: "Ushuaia - La Ciudad Más Austral del Mundo | Antartur",
    description: "Ushuaia, la ciudad más austral del mundo. Información sobre turismo, excursiones, hoteles y gastronomía.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ushuaia - La Ciudad Más Austral | Antartur",
    description: "Ushuaia, la ciudad más austral del mundo.",
  },
};

export default function UshuaiaPage() {
  return (
    <>
      <Hero variant="internal" pageKey="ushuaia" />
      <main className="mainContainer">
        {/* Contenido de la página */}
      </main>
    </>
  );
}

