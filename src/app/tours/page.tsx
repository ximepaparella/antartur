import type { Metadata } from "next";
import { ToursGrid } from "@/modules/tours/components/ToursGrid/ToursGrid";
import { Heading } from "@/components/common/Heading/Heading";
import { getToursServer } from "@/lib/api/tours-server";
import { toTourCardData } from "@/lib/adapters/tourAdapter";

// Forzar renderizado dinámico ya que depende de datos de la base de datos
export const dynamic = 'force-dynamic';

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

export default async function ToursPage() {
  let tours: ReturnType<typeof toTourCardData>[] = [];

  try {
    // Obtener todos los tours activos desde la API (Server Component)
    const response = await getToursServer({ isActive: true, includeImages: true, includePrices: true });
    tours = response.data.map(toTourCardData);
  } catch (error) {
    console.error("Error loading tours:", error);
    // Continuar con array vacío para mostrar página sin tours
  }

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

