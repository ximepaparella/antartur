import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";

export const metadata: Metadata = {
  title: "Información Hotelera - Ushuaia - Antartur",
  description: "Información hotelera en Ushuaia",
};

export default function HotelesPage() {
  return (
    <>
      <Hero variant="internal" pageKey="ushuaia-hoteles" />
      <main style={{ padding: "2rem", minHeight: "50vh" }}>
        {/* Contenido de la página */}
      </main>
    </>
  );
}

