import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";

export const metadata: Metadata = {
  title: "Contacto - Antartur",
  description: "Contacta con Antartur",
};

export default function ContactoPage() {
  return (
    <>
      <Hero variant="internal" pageKey="contacto" />
      <main style={{ padding: "2rem", minHeight: "50vh" }}>
        {/* Contenido de la página */}
      </main>
    </>
  );
}

