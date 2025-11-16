import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";

export const metadata: Metadata = {
  title: "Antártida - Antartur",
  description: "Viajes a la Antártida",
};

export default function AntartidaPage() {
  return (
    <>
      <Hero variant="internal" pageKey="antartida" />
      <main style={{ padding: "2rem", minHeight: "50vh" }}>
        {/* Contenido de la página */}
      </main>
    </>
  );
}

