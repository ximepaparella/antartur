import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Contacto - Antartur",
  description: "Contacta con Antartur",
};

export default function ContactoPage() {
  return (
    <>
      <Hero variant="internal" pageKey="contacto" />
      <main className="mainContainer">
        {/* Contenido de la página */}
      </main>
    </>
  );
}

