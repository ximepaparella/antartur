import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import { Testimonials } from "@/components/common/Testimonials/Testimonials";
import testimonialsData from "@/modules/ui/components/Testimonials/testimonialsdata.json";
import { Banner } from "@/modules/ui/components/Banner/Banner";
import { ToursGrid } from "@/modules/tours/components/ToursGrid/ToursGrid";
import { getToursServer } from "@/lib/api/tours-server";
import { toTourCardData } from "@/lib/adapters/tourAdapter";

// Forzar renderizado dinámico ya que depende de datos de la base de datos
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Verano - Excursiones de Verano en Tierra del Fuego | Antartur",
  description: "Los días son largos y el clima en verano es muy ameno! Las temperaturas en Verano van entre los 6° y los 15 grados. Descubrí nuestras excursiones de verano en Ushuaia.",
  keywords: ["verano", "Ushuaia", "excursiones verano", "Tierra del Fuego verano", "turismo verano"],
  openGraph: {
    title: "Verano - Excursiones de Verano en Tierra del Fuego | Antartur",
    description: "Los días son largos y el clima en verano es muy ameno! Descubrí nuestras excursiones de verano en Ushuaia.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verano - Excursiones de Verano | Antartur",
    description: "Los días son largos y el clima en verano es muy ameno! Descubrí nuestras excursiones de verano en Ushuaia.",
  },
};

export default async function VeranoPage() {
  const testimonials = testimonialsData.verano;
  const summerToursResponse = await getToursServer({ category: "summer", isActive: true, includeImages: true, includePrices: true });
  const summerTours = summerToursResponse.data.map(toTourCardData);

  return (
    <>
      <Hero variant="internal" pageKey="verano" />
      <main className="mainContainer">
        <Heading
          title="TEMPORADA DE VERANO"
          paragraph='Los días son largos y el clima en verano es muy ameno! Las temperaturas en Verano, van entre los 6° y los 15 grados aproximado. El clima de Ushuaia es bastante cambiante, la recomendación será siempre "campera obligatoria" y si es impermeable mucho mejor!'
        />
        <ToursGrid tours={summerTours} category="summer" />
      </main>
    </>
  );
}

