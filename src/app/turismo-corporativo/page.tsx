import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";

export const metadata: Metadata = {
  title: "Turismo Corporativo - Antartur",
  description: "Turismo corporativo en Tierra del Fuego",
};

export default function TurismoCorporativoPage() {
  return (
    <>
      <Hero variant="internal" pageKey="turismo-corporativo" />
      <main style={{ padding: "2rem", minHeight: "50vh" }}>
        {/* Contenido de la página */}
      </main>
    </>
  );
}

