import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";

export const metadata: Metadata = {
  title: "Invierno - Antartur",
  description: "Excursiones de invierno en Tierra del Fuego",
};

export default function InviernoPage() {
  return (
    <>
      <Hero variant="internal" pageKey="invierno" />
      <main style={{ padding: "2rem", minHeight: "50vh" }}>
        {/* Contenido de la página */}
      </main>
    </>
  );
}

