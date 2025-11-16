import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";

export const metadata: Metadata = {
  title: "Información Gastronómica - Ushuaia - Antartur",
  description: "Información gastronómica en Ushuaia",
};

export default function GastronomiaPage() {
  return (
    <>
      <Hero variant="internal" pageKey="ushuaia-gastronomia" />
      <main style={{ padding: "2rem", minHeight: "50vh" }}>
        {/* Contenido de la página */}
      </main>
    </>
  );
}

