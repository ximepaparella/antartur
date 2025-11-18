import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/modules/ui/components/Hero/Hero";
import { TourQuickInfo } from "@/modules/tours/components/TourQuickInfo/TourQuickInfo";
import { TourInfo } from "@/modules/tours/components/TourInfo/TourInfo";
import { TourGallery } from "@/modules/tours/components/TourGallery/TourGallery";
import { TourFeaturedInfo } from "@/modules/tours/components/TourFeaturedInfo/TourFeaturedInfo";
import { TourTimeline } from "@/modules/tours/components/TourTimeline/TourTimeline";
import { Banner, BannerBooking } from "@/modules/ui/components/Banner";
import { Testimonials } from "@/components/common/Testimonials/Testimonials";
import { Heading } from "@/components/common/Heading/Heading";
import { ToursGrid } from "@/modules/tours/components/ToursGrid/ToursGrid";
import { getTourById } from "@/modules/tours/components/ToursGrid/toursData";
import { getFullTourById } from "@/modules/tours/components/ToursGrid/tourFullData";
import { getAllTours } from "@/modules/tours/components/ToursGrid/toursData";
import type { Testimonial as TestimonialType } from "@/modules/ui/components/Testimonials/types";
import styles from "./page.module.scss";

interface TourPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TourPageProps): Promise<Metadata> {
  const { id } = await params;
  const fullTour = getFullTourById(id);
  const tour = getTourById(id);

  if (!fullTour && !tour) {
    return {
      title: "Tour no encontrado | Antartur",
    };
  }

  // Usar datos completos si están disponibles, sino usar datos básicos
  const seo = fullTour?.seo;
  const title = seo?.metaTitle || `${tour?.title || "Tour"} | Antartur`;
  const description = seo?.metaDescription || tour?.subtitle || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_AR",
      images: seo?.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    alternates: {
      canonical: seo?.canonicalUrl,
    },
  };
}

export default async function TourPage({ params }: TourPageProps) {
  const { id } = await params;
  const fullTour = getFullTourById(id);
  const tour = getTourById(id);

  // Si no hay datos completos, usar datos básicos como fallback
  if (!fullTour && !tour) {
    notFound();
  }

  // Si hay datos completos, usar esos; sino usar datos básicos
  if (fullTour) {
    // Los testimonios ya están en el formato correcto
    const testimonials: TestimonialType[] = fullTour.testimonials || [];

    // Obtener todos los tours para el grid
    const allTours = getAllTours();
    const relatedCategory = fullTour.card.category;

    return (
      <>
        {/* 1. Hero */}
        <Hero
          variant="tour"
          title={fullTour.hero.headline}
          backgroundImage={fullTour.hero.backgroundImage}
          ctaText={fullTour.quickInfo.ctaLabel || "RESERVAR"}
          ctaHref={fullTour.quickInfo.ctaHref || "#booking"}
        />

        {/* 2. QuickInfo */}
        <TourQuickInfo
          price={fullTour.quickInfo.price}
          items={fullTour.quickInfo.items}
          restriction={fullTour.quickInfo.restriction}
          alternative={fullTour.quickInfo.alternative}
          ctaLabel={fullTour.quickInfo.ctaLabel}
          ctaHref={fullTour.quickInfo.ctaHref}
        />

        {/* 3. TourInfo */}
        <TourInfo
          title="AVENTURA Y PAISAJES ÚNICOS"
          paragraphs={fullTour.description.long}
        />

        {/* 4. TourGallery */}
        {fullTour.gallery && fullTour.gallery.length > 0 && (
          <TourGallery images={fullTour.gallery} />
        )}

        {/* 5. FeaturedInfo */}
        {fullTour.featuredInfo && fullTour.featuredInfo.length > 0 && (
          <TourFeaturedInfo items={fullTour.featuredInfo} />
        )}

        {/* 6. Timeline */}
        <TourTimeline
          items={fullTour.timeline.items}
          importantNote={fullTour.timeline.importantNote}
        />

        {/* 7. Banner con booking module */}
        <Banner
          backgroundImage={fullTour.hero.backgroundImage}
          showOverlay={true}
        >
          <div id="booking">
            <BannerBooking
              tourId={fullTour.card.id}
              tourTitle={fullTour.card.title}
              availability={fullTour.booking?.availability}
              pricing={fullTour.booking?.pricing}
            />
          </div>
        </Banner>

        {/* 8. Testimonials */}
        {testimonials.length > 0 && (
          <Testimonials testimonials={testimonials} variant="dark" />
        )}

        {/* 9. Heading + ToursGrid */}
        <Heading
          title="MÁS AVENTURAS"
          paragraph="Conocé todas las aventuras que te esperan con Antartur Turismo."
        />
        <div className="mainContainer">
          <ToursGrid tours={allTours} category={relatedCategory} />
        </div>
      </>
    );
  }

  // Fallback: usar datos básicos si no hay datos completos
  // En este punto, tour debe existir porque ya validamos arriba
  if (!tour) {
    notFound();
  }

  return (
    <>
      <Hero
        variant="tour"
        title={tour.title}
        backgroundImage={tour.featuredImage}
        ctaText="RESERVAR"
        ctaHref="#booking"
      />
      <div className="mainContainer" style={{ padding: "2rem 0" }}>
        <h1>{tour.title}</h1>
        <p>{tour.subtitle}</p>
        <p>Dificultad: {tour.difficulty}</p>
        {tour.price && <p>Precio: {tour.price}</p>}
        <p>Esta página está en desarrollo. Los datos completos del tour estarán disponibles pronto.</p>
      </div>
    </>
  );
}

