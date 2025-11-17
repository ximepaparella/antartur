import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Información Gastronómica - Ushuaia - Antartur",
  description: "Información gastronómica en Ushuaia",
};

export default function GastronomiaPage() {
  return (
    <>
      <Hero variant="internal" pageKey="ushuaia-gastronomia" />
      <main className="mainContainer">
        <Heading
          title="GASTRONOMÍA EN USHUAIA"
          paragraph="Tenemos más de 100 alojamientos habilitados, incluyendo hoteles cinco estrellas de categoría internacional, cabañas de primer nivel en medio del bosque, aparts y hostels con habitaciones compartidas. Cualquiera que venga podrá pasarla muy bien."
        />
      </main>
    </>
  );
}

