import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";

export const metadata: Metadata = {
  title: "Verano - Antartur",
  description: "Excursiones de verano en Tierra del Fuego",
};

export default function VeranoPage() {
  return (
    <>
      <Hero variant="internal" pageKey="verano" />
      <main style={{ padding: "2rem", minHeight: "50vh" }}>
        {/* Contenido de la página */}
      </main>
    </>
  );
}

