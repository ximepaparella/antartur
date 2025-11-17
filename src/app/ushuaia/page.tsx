import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Ushuaia - Antartur",
  description: "Información sobre Ushuaia",
};

export default function UshuaiaPage() {
  return (
    <>
      <Hero variant="internal" pageKey="ushuaia" />
      <main className="mainContainer">
        {/* Contenido de la página */}
      </main>
    </>
  );
}

