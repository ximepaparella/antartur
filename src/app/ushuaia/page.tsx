import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";

export const metadata: Metadata = {
  title: "Ushuaia - Antartur",
  description: "Información sobre Ushuaia",
};

export default function UshuaiaPage() {
  return (
    <>
      <Hero variant="internal" pageKey="ushuaia" />
      <main style={{ padding: "2rem", minHeight: "50vh" }}>
        {/* Contenido de la página */}
      </main>
    </>
  );
}

