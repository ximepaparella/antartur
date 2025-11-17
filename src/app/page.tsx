import type { Metadata } from "next";
import { Hero } from "@/modules/content/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import { Testimonials } from "@/components/common/Testimonials/Testimonials";
import testimonialsData from "@/modules/content/components/Testimonials/testimonialsdata.json";
import { Banner } from "@/modules/content/components/Banner/Banner";
import { ToursGrid } from "@/modules/content/components/ToursGrid/ToursGrid";
import { getToursByCategory } from "@/modules/content/components/ToursGrid/toursData";

export const metadata: Metadata = {
  title: "Antartur - Experiencia & Aventura en Tierra del Fuego",
  description: "Descubrí las mejores excursiones y aventuras en Ushuaia, Tierra del Fuego. Excursiones de invierno y verano, viajes a la Antártida y turismo corporativo.",
  keywords: ["Ushuaia", "Tierra del Fuego", "Antártida", "excursiones", "turismo", "aventura"],
  openGraph: {
    title: "Antartur - Experiencia & Aventura en Tierra del Fuego",
    description: "Descubrí las mejores excursiones y aventuras en Ushuaia, Tierra del Fuego.",
    type: "website",
    locale: "es_AR",
    siteName: "Antartur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antartur - Experiencia & Aventura",
    description: "Descubrí las mejores excursiones y aventuras en Ushuaia, Tierra del Fuego.",
  },
};

export default function Home() {
  const testimonials = testimonialsData.home;

  // Tours de verano
  const summerTours = getToursByCategory("summer");

  // Tours de invierno
  const winterTours = getToursByCategory("winter");

  return (
    <>
      <Hero variant="home" pageKey="home" />
      <main className="mainContainer">
        <Heading
          iconName="map-route"
          title="ELEGÍ TU AVENTURA"
        />
        <ToursGrid tours={summerTours} category="summer" />
        <Heading
          title="EXCURSIONES DE INVIERNO"
          paragraph="En antartur tenemos excursiones para todas las temporadas del año, pudiendo así disfrutar de diversas aventuras según la época del año."
        />
        <ToursGrid tours={winterTours} category="winter" />
      </main>
      <Banner
        backgroundImage="/images/banners/hero-home.jpg"
        title="Disfrutá desde otra mirada."
        excerpt="Conocé el fin del mundo en todas sus temporadas y descubrí maravillas únicas en sus paisajes."
        linkText="Descubrí más"
        linkUrl="/verano"
      />
      <Testimonials testimonials={testimonials} variant="light" />
    </>
  );
}

