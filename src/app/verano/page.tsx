import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import { Testimonials } from "@/components/common/Testimonials/Testimonials";
import testimonialsData from "@/modules/content/components/Testimonials/testimonialsdata.json";
import { Banner } from "@/modules/content/components/Banner/Banner";
import { ToursGrid } from "@/modules/content/components/ToursGrid/ToursGrid";
import { getToursByCategory } from "@/modules/content/components/ToursGrid/toursData";

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

export default function VeranoPage() {
  const testimonials = testimonialsData.verano;
  const summerTours = getToursByCategory("summer");

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

