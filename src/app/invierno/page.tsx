import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import { ToursGrid } from "@/modules/tours/components/ToursGrid/ToursGrid";
import { getToursServer } from "@/modules/tours/api/server/toursServer";
import { toTourCardData } from "@/lib/adapters/tourAdapter";

// Forzar renderizado dinámico ya que depende de datos de la base de datos
export const dynamic = 'force-dynamic';

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

export default async function InviernoPage() {
  let winterTours: ReturnType<typeof toTourCardData>[] = [];

  try {
    const winterToursResponse = await getToursServer({ category: "winter", isActive: true, includeImages: true, includePrices: true });
    winterTours = winterToursResponse.data.map(toTourCardData);
  } catch (error) {
    console.error("Error loading winter tours:", error);
    // Continuar con array vacío para mostrar página sin tours
  }

  return (
    <>
      <Hero variant="internal" pageKey="invierno" />
      <main className="mainContainer">
        <Heading
          title="TEMPORADA DE INVIERNO"
          paragraph="Nuestra temporada de invierno comienza el 21 de junio y se extiende hasta los primeros días de octubre."
        />
        <ToursGrid tours={winterTours} category="winter" />
      </main>
    </>
  );
}

