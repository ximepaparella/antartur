import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { WindyWidget } from "@/modules/content/components/WindyWidget/WindyWidget";

export const metadata: Metadata = {
  title: "Clima - Antartur",
  description: "Información del clima en Tierra del Fuego",
};

export default function ClimaPage() {
  return (
    <>
      <Hero variant="internal" pageKey="clima" />
      <main style={{ margin: 0, padding: 0, width: "100%" }}>
        <WindyWidget />
      </main>
    </>
  );
}
