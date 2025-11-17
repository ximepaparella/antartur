import type { Metadata } from "next";
import { ToursGrid } from "@/modules/content/components/ToursGrid/ToursGrid";
import { Heading } from "@/components/common/Heading/Heading";
import { getAllTours } from "@/modules/content/components/ToursGrid/toursData";

export const metadata: Metadata = {
  title: "Tours - Excursiones y Aventuras | Antartur",
  description: "Descubrí nuestras excursiones y aventuras en Tierra del Fuego. Trekking, off road, canoas y más actividades para todas las temporadas.",
  keywords: ["tours", "excursiones", "aventuras", "Tierra del Fuego", "Ushuaia", "trekking", "off road"],
  openGraph: {
    title: "Tours - Excursiones y Aventuras | Antartur",
    description: "Descubrí nuestras excursiones y aventuras en Tierra del Fuego.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tours - Excursiones y Aventuras | Antartur",
    description: "Descubrí nuestras excursiones y aventuras en Tierra del Fuego.",
  },
};

export default function ToursPage() {
  const tours = getAllTours();

  return (
    <>
      <main className="mainContainer">
        <Heading
          title="NUESTROS TOURS"
          paragraph="Descubrí nuestras excursiones y aventuras en Tierra del Fuego. Experiencias únicas para todas las temporadas."
        />
        <ToursGrid tours={tours} />
      </main>
    </>
  );
}

