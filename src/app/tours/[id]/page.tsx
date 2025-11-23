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
import { getTourBySlugServer, getToursServer } from "@/lib/api/tours-server";
import { toFullTourData, toTourCardData } from "@/lib/adapters/tourAdapter";
import type { TourFullResponse } from "@/modules/tours/api/dto/toursDto";
import type { Testimonial as TestimonialType } from "@/modules/ui/components/Testimonials/types";
import { generateWhatsAppLink } from "@/lib/utils/whatsapp";
import styles from "./page.module.scss";

interface TourPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TourPageProps): Promise<Metadata> {
  const { id } = await params;
  const tour = await getTourBySlugServer(id, { includeContent: true });

  if (!tour) {
    return {
      title: "Tour no encontrado | Antartur",
    };
  }

  const title = tour.metaTitle || `${tour.name} | Antartur`;
  const description = tour.metaDescription || tour.shortDescription;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_AR",
      images: tour.ogImage ? [{ url: tour.ogImage }] : undefined,
    },
    alternates: {
      canonical: tour.canonicalUrl || undefined,
    },
  };
}

export default async function TourPage({ params }: TourPageProps) {
  const { id } = await params;
  
  // Obtener tour completo desde la API con todo el contenido (Server Component)
  const tourResponse = await getTourBySlugServer(id, {
    includeImages: true,
    includeDepartures: true,
    includePrices: true,
    includeContent: true,
  });

  if (!tourResponse) {
    notFound();
  }

  // Transformar respuesta de API a formato esperado por componentes
  // tourResponse es TourFullResponse cuando includeContent o includeDepartures es true
  const fullTour = toFullTourData(tourResponse as TourFullResponse);

  // Transformar testimonials al formato esperado
  const testimonials: TestimonialType[] =
    fullTour.testimonials?.map((t) => ({
      id: t.id,
      text: t.text,
      author: t.author,
      avatar: t.avatar,
      country: t.country,
    })) || [];

  // Obtener tours relacionados de la misma categoría (Server Component)
  const relatedToursResponse = await getToursServer({
    category: fullTour.card?.category,
    isActive: true,
    includeImages: true,
    includePrices: true,
  });
  const relatedTours = relatedToursResponse.data
    .filter((t: { slug: string }) => t.slug !== id) // Excluir el tour actual
    .map(toTourCardData);

  // Si hay datos completos, renderizar página completa
  if (fullTour.card && fullTour.hero && fullTour.quickInfo && fullTour.description) {
    // Determinar si hay disponibilidad para reservas
    const hasAvailability = fullTour.booking?.availability && fullTour.booking.availability.length > 0;
    const hasPricing = fullTour.quickInfo.price && fullTour.quickInfo.price.trim() !== "";
    
    // Si no hay disponibilidad, cambiar CTA a WhatsApp
    const ctaLabel = hasAvailability ? (fullTour.quickInfo.ctaLabel || "RESERVAR") : "CONSULTAR";
    const ctaHref = hasAvailability 
      ? (fullTour.quickInfo.ctaHref || "#booking")
      : generateWhatsAppLink(fullTour.hero.headline);

    return (
      <>
        {/* 1. Hero */}
        <Hero
          variant="tour"
          title={fullTour.hero.headline}
          backgroundImage={fullTour.hero.backgroundImage}
          ctaText={ctaLabel}
          ctaHref={ctaHref}
        />

        {/* 2. QuickInfo */}
        <TourQuickInfo
          tourId={fullTour.card.id}
          price={fullTour.quickInfo.price}
          items={fullTour.quickInfo.items}
          restriction={fullTour.quickInfo.restriction}
          alternative={fullTour.quickInfo.alternative}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
          hasPricing={hasPricing}
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
        {fullTour.timeline && fullTour.timeline.items && fullTour.timeline.items.length > 0 && (
          <TourTimeline
            items={fullTour.timeline.items}
            importantNote={fullTour.timeline.importantNote}
          />
        )}

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
              prices={fullTour.booking?.prices}
              additionals={fullTour.booking?.additionals}
              minAge={fullTour.restrictions?.minAge}
              minPassengers={fullTour.restrictions?.minPassengers}
              restrictionText={fullTour.quickInfo?.restriction}
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
          <ToursGrid tours={relatedTours} category={fullTour.card.category} />
        </div>
      </>
    );
  }

  // Fallback: si no hay datos completos, mostrar página básica
  return (
    <>
      <Hero
        variant="tour"
        title={tourResponse.name}
        backgroundImage={tourResponse.heroImage}
        ctaText="RESERVAR"
        ctaHref="#booking"
      />
      <div className="mainContainer" style={{ padding: "2rem 0" }}>
        <h1>{tourResponse.name}</h1>
        <p>{tourResponse.subtitle}</p>
        <p>Dificultad: {tourResponse.difficulty}</p>
        <p>{tourResponse.shortDescription}</p>
      </div>
    </>
  );
}

