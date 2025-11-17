import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Invierno - Excursiones de Invierno en Tierra del Fuego | Antartur",
  description: "Nuestra temporada de invierno comienza el 21 de junio y se extiende hasta los primeros días de octubre. Descubrí nuestras excursiones de invierno en Ushuaia.",
  keywords: ["invierno", "Ushuaia", "excursiones invierno", "Tierra del Fuego invierno", "turismo invierno", "nieve"],
  openGraph: {
    title: "Invierno - Excursiones de Invierno en Tierra del Fuego | Antartur",
    description: "Nuestra temporada de invierno comienza el 21 de junio y se extiende hasta los primeros días de octubre.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invierno - Excursiones de Invierno | Antartur",
    description: "Nuestra temporada de invierno comienza el 21 de junio y se extiende hasta los primeros días de octubre.",
  },
};

export default function InviernoPage() {
  return (
    <>
      <Hero variant="internal" pageKey="invierno" />
      <main className="mainContainer">
        <Heading
          title="TEMPORADA DE INVIERNO"
          paragraph="Nuestra temporada de invierno comienza el 21 de junio y se extiende hasta los primeros días de octubre."
        />
      </main>
    </>
  );
}

