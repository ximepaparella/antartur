import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";

export const metadata: Metadata = {
  title: "Gastronomía en Ushuaia - Restaurantes y Comida | Antartur",
  description: "Descubrí la gastronomía de Ushuaia. Restaurantes, comida típica de Tierra del Fuego y opciones gastronómicas en la ciudad más austral del mundo.",
  keywords: ["gastronomía Ushuaia", "restaurantes Ushuaia", "comida Ushuaia", "gastronomía Tierra del Fuego"],
  openGraph: {
    title: "Gastronomía en Ushuaia - Restaurantes y Comida | Antartur",
    description: "Descubrí la gastronomía de Ushuaia. Restaurantes, comida típica de Tierra del Fuego y opciones gastronómicas.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gastronomía en Ushuaia | Antartur",
    description: "Descubrí la gastronomía de Ushuaia. Restaurantes y comida típica de Tierra del Fuego.",
  },
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

