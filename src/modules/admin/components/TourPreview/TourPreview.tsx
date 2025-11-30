"use client";

import { Hero } from "@/modules/ui/components/Hero/Hero";
import { TourQuickInfo } from "@/modules/tours/components/TourQuickInfo/TourQuickInfo";
import { TourInfo } from "@/modules/tours/components/TourInfo/TourInfo";
import { TourGallery } from "@/modules/tours/components/TourGallery/TourGallery";
import { TourFeaturedInfo } from "@/modules/tours/components/TourFeaturedInfo/TourFeaturedInfo";
import { TourTimeline } from "@/modules/tours/components/TourTimeline/TourTimeline";
import { Testimonials } from "@/components/common/Testimonials/Testimonials";
import { toFullTourData } from "@/lib/adapters/tourAdapter";
import type { TourFullResponse } from "@/modules/tours/api/dto/toursDto";
import styles from "./TourPreview.module.scss";

interface TourPreviewProps {
  tourData: any;
}

export function TourPreview({ tourData }: TourPreviewProps) {
  if (!tourData) {
    return <div className={styles.empty}>No hay datos para mostrar</div>;
  }

  // Transformar datos al formato esperado por los componentes
  const transformedData = transformTourDataForPreview(tourData);

  // Obtener imágenes
  const featuredImage = tourData.featuredImage || "";
  const heroImage = tourData.heroImage || "";
  const galleryImages =
    tourData.images
      ?.filter((img: any) => img.imageType === "GALLERY")
      .map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.altText,
      })) || [];

  // Obtener precios
  const arsPrice = tourData.prices?.find((p: any) => p.currency === "ARS");
  const priceText = arsPrice
    ? `ARS ${arsPrice.priceAdult}`
    : tourData.alternativePrice || "Consultar";

  // QuickInfo items
  const quickInfoItems =
    tourData.quickInfoItems?.map((item: any) => ({
      icon: item.icon as any,
      label: item.label,
      value: item.value,
    })) || [];

  // Featured Info
  const featuredInfoItems =
    tourData.featuredInfos?.map((item: any) => ({
      icon: item.icon as any,
      title: item.title,
      description: item.description,
    })) || [];

  // Timeline
  const timelineItems =
    tourData.timelineItems?.map((item: any) => ({
      timeLabel: item.timeLabel,
      title: item.title,
      description: item.description,
    })) || [];

  // Testimonials
  const testimonials =
    tourData.testimonials?.map((item: any) => ({
      id: item.id,
      text: item.text,
      author: item.author,
      avatar: item.avatar,
      country: item.country,
    })) || [];

  return (
    <div className={styles.preview}>
      <div className={styles.previewHeader}>
        <h2>Vista Previa del Tour</h2>
        <p className={styles.previewNote}>
          Esta es una aproximación de cómo se verá el tour en el sitio público
        </p>
      </div>

      <div className={styles.previewContent}>
        {/* Hero */}
        <Hero
          variant="tour"
          title={tourData.name || "Nombre del Tour"}
          backgroundImage={heroImage}
          ctaText={tourData.ctaLabel || "RESERVAR"}
          ctaHref={tourData.ctaHref || "#booking"}
        />

        {/* QuickInfo */}
        <TourQuickInfo
          tourId={tourData.id || ""}
          price={priceText}
          items={quickInfoItems}
          restriction={tourData.restrictionText || ""}
          alternative={
            tourData.alternativeText && tourData.alternativePrice
              ? { text: tourData.alternativeText, price: tourData.alternativePrice }
              : undefined
          }
          ctaLabel={tourData.ctaLabel || "RESERVAR"}
          ctaHref={tourData.ctaHref || "#booking"}
          hasPricing={!!arsPrice}
        />

        {/* TourInfo */}
        <TourInfo
          title="AVENTURA Y PAISAJES ÚNICOS"
          paragraphs={tourData.longDescription || tourData.shortDescription || ""}
        />

        {/* Gallery */}
        {galleryImages.length > 0 && <TourGallery images={galleryImages} />}

        {/* FeaturedInfo */}
        {featuredInfoItems.length > 0 && <TourFeaturedInfo items={featuredInfoItems} />}

        {/* Timeline */}
        {timelineItems.length > 0 && (
          <TourTimeline
            items={timelineItems}
            importantNote={tourData.timelineImportantNote || undefined}
          />
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && <Testimonials testimonials={testimonials} />}
      </div>
    </div>
  );
}

function transformTourDataForPreview(tourData: any): Partial<any> {
  // Esta función transforma los datos del formulario al formato esperado
  // por los componentes de preview
  return {
    card: {
      id: tourData.id,
      name: tourData.name,
      subtitle: tourData.subtitle,
      featuredImage: tourData.featuredImage,
      category: tourData.category,
    },
    hero: {
      headline: tourData.name,
      subheadline: tourData.heroSubheadline,
      backgroundImage: tourData.heroImage,
    },
    quickInfo: {
      price: tourData.prices?.[0]?.priceAdult?.toString() || tourData.alternativePrice || "",
      items: tourData.quickInfoItems || [],
      restriction: tourData.restrictionText || "",
      alternative: tourData.alternativeText
        ? { text: tourData.alternativeText, price: tourData.alternativePrice || "" }
        : undefined,
      ctaLabel: tourData.ctaLabel,
      ctaHref: tourData.ctaHref,
    },
    description: {
      short: tourData.shortDescription || "",
      long: tourData.longDescription || "",
    },
    gallery: tourData.images?.filter((img: any) => img.imageType === "GALLERY") || [],
    featuredInfo: tourData.featuredInfos || [],
    timeline: {
      items: tourData.timelineItems || [],
      importantNote: tourData.timelineImportantNote,
    },
    testimonials: tourData.testimonials || [],
  };
}

