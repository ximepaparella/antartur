import type { Metadata } from "next";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { Heading } from "@/components/common/Heading/Heading";
import { Testimonials } from "@/components/common/Testimonials/Testimonials";
import testimonialsData from "@/modules/ui/components/Testimonials/testimonialsdata.json";
import { Banner, BannerText } from "@/modules/ui/components/Banner";
import { ToursGrid } from "@/modules/tours/components/ToursGrid/ToursGrid";
import { getToursServer } from "@/modules/tours/api/server/toursServer";
import { toTourCardData } from "@/lib/adapters/tourAdapter";
import { getSiteSettings } from "@/modules/settings/repository";

// Forzar renderizado dinámico ya que depende de datos de la base de datos
export const dynamic = 'force-dynamic';

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

export default async function Home() {
  const testimonials = testimonialsData.home;

  // Obtener tours desde la API (Server Component) con manejo de errores
  let summerTours: ReturnType<typeof toTourCardData>[] = [];
  let winterTours: ReturnType<typeof toTourCardData>[] = [];

  try {
    const summerResponse = await getToursServer({ category: "summer", isActive: true, includeImages: true, includePrices: true });
    const winterResponse = await getToursServer({ category: "winter", isActive: true, includeImages: true, includePrices: true });

    // Transformar a TourCardData
    summerTours = summerResponse.data.map(toTourCardData);
    winterTours = winterResponse.data.map(toTourCardData);
  } catch (error) {
    // En producción, loguear error pero continuar con arrays vacíos
    console.error("Error loading tours:", error);
    // Las páginas mostrarán grids vacíos en lugar de fallar completamente
  }

  const settings = await getSiteSettings();

  const showSummerFirst =
    settings.homePrimarySeason === "SUMMER" ||
    (settings.homePrimarySeason === "AUTO" &&
      (new Date().getMonth() >= 9 || new Date().getMonth() <= 2)); // aproximadamente temporada de verano

  return (
    <>
      <Hero variant="home" pageKey="home" />
      <main className="mainContainer">
        <Heading iconName="map-route" title="ELEGÍ TU AVENTURA" />
        {showSummerFirst ? (
          <>
            <ToursGrid tours={summerTours} category="summer" />
            <Heading
              title="EXCURSIONES DE INVIERNO"
              paragraph="En antartur tenemos excursiones para todas las temporadas del año, pudiendo así disfrutar de diversas aventuras según la época del año."
            />
            <ToursGrid tours={winterTours} category="winter" />
          </>
        ) : (
          <>
            <ToursGrid tours={winterTours} category="winter" />
            <Heading
              title="EXCURSIONES DE VERANO"
              paragraph="En antartur tenemos excursiones para todas las temporadas del año, pudiendo así disfrutar de diversas aventuras según la época del año."
            />
            <ToursGrid tours={summerTours} category="summer" />
          </>
        )}
      </main>
      <Banner backgroundImage="/images/banners/hero-home.jpg">
        <BannerText
          title="Disfrutá desde otra mirada."
          excerpt="Conocé el fin del mundo en todas sus temporadas y descubrí maravillas únicas en sus paisajes."
          linkText="Descubrí más"
          linkUrl="/verano"
        />
      </Banner>
      <Testimonials testimonials={testimonials} variant="light" />
    </>
  );
}

