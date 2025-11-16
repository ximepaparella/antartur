import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";

export const metadata: Metadata = {
  title: "Clima - Antartur",
  description: "Información del clima en Tierra del Fuego",
};

export default function ClimaPage() {
  return (
    <>
      <Hero variant="internal" pageKey="clima" />
      <main style={{ padding: "2rem", minHeight: "50vh" }}>
        {/* Contenido de la página */}
      </main>
    </>
  );
}

