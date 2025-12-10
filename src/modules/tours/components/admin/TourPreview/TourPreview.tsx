"use client";

import { Hero } from "@/modules/ui/components/Hero/Hero";
import { TourQuickInfo } from "@/modules/tours/components/TourQuickInfo/TourQuickInfo";
import { TourInfo } from "@/modules/tours/components/TourInfo/TourInfo";
import { TourGallery } from "@/modules/tours/components/TourGallery/TourGallery";
import { TourFeaturedInfo } from "@/modules/tours/components/TourFeaturedInfo/TourFeaturedInfo";
import { TourTimeline } from "@/modules/tours/components/TourTimeline/TourTimeline";
import { Testimonials } from "@/components/common/Testimonials/Testimonials";
import type { TourPreviewProps } from "@/modules/tours/types/admin";
import styles from "./TourPreview.module.scss";

export function TourPreview({ tourData }: TourPreviewProps) {
  if (!tourData) {
    return <div className={styles.empty}>No hay datos para mostrar</div>;
  }

  // Obtener imágenes
  const heroImage = tourData.heroImage || "";
  const galleryImages =
    tourData.images
      ?.filter((img: any) => img.imageType === "GALLERY" && img.url && img.url.trim() !== "")
      .map((img: any) => ({
        id: img.id || `gallery-${Math.random()}`,
        src: img.url,
        alt: img.altText || tourData.name,
      })) || [];

  // Obtener precios
  const arsPrice = tourData.prices?.find((p: any) => p.currency === "ARS");
  const priceText = arsPrice
    ? `ARS ${arsPrice.priceAdult?.toLocaleString("es-AR")}`
    : tourData.alternativePrice || "Consultar";

  // QuickInfo items - asegurar formato correcto
  const quickInfoItems =
    tourData.quickInfoItems?.map((item: any, index: number) => ({
      id: item.id || `quickinfo-${index}-${Date.now()}`,
      icon: item.icon || "info",
      label: item.label || "",
      value: item.value || "",
    })) || [];

  // Featured Info - asegurar formato correcto
  const featuredInfoItems =
    tourData.featuredInfos?.map((item: any, index: number) => ({
      id: item.id || `featured-${index}-${Date.now()}`,
      icon: item.icon || "info",
      title: item.title || "",
      description: item.description || "",
    })) || [];

  // Timeline - asegurar formato correcto
  const timelineItems =
    tourData.timelineItems?.map((item: any) => ({
      timeLabel: item.timeLabel || "",
      title: item.title || "",
      description: item.description || "",
    })) || [];

  // Testimonials - asegurar formato correcto
  const testimonials =
    tourData.testimonials?.map((item: any) => ({
      id: item.id || `testimonial-${Math.random()}`,
      text: item.text || "",
      author: item.author || "",
      avatar: item.avatar || "",
      country: item.country || "",
    })) || [];

  // Restrictions - asegurar formato correcto
  const restrictions =
    tourData.restrictions?.map((item: any) => item.text || "").filter(Boolean) || [];

  return (
    <div className={styles.preview}>
      <div className={styles.previewHeader}>
        <h2>Vista Previa del Tour</h2>
        <p className={styles.previewNote}>
          Esta es una aproximación de cómo se verá el tour en el sitio público.
          Algunos estilos pueden variar ligeramente.
        </p>
      </div>

      <div className={styles.previewContent}>
        {/* Hero Section */}
        <div className={styles.previewSection}>
          <Hero
            variant="tour"
            title={tourData.name || "Nombre del Tour"}
            backgroundImage={heroImage}
            ctaText={tourData.ctaLabel || "RESERVAR"}
            ctaHref={tourData.ctaHref || "#booking"}
          />
        </div>

        {/* QuickInfo Section */}
        {(quickInfoItems.length > 0 || arsPrice || restrictions.length > 0) && (
          <div className={styles.previewSection}>
            <TourQuickInfo
              tourId={tourData.id || "preview"}
              price={priceText}
              items={quickInfoItems}
              restrictions={restrictions.length > 0 ? restrictions : undefined}
              alternative={
                tourData.alternativeText && tourData.alternativePrice
                  ? { text: tourData.alternativeText, price: tourData.alternativePrice }
                  : undefined
              }
              ctaLabel={tourData.ctaLabel || "RESERVAR"}
              ctaHref={tourData.ctaHref || "#booking"}
              hasPricing={!!arsPrice}
            />
          </div>
        )}

        {/* Description Section */}
        {(tourData.longDescription || tourData.shortDescription) && (
          <div className={styles.previewSection}>
            <TourInfo
              title="AVENTURA Y PAISAJES ÚNICOS"
              paragraphs={
                (tourData.longDescription || tourData.shortDescription || "")
                  .split('\n')
                  .filter(p => p.trim().length > 0)
                  .map(p => p.trim())
              }
            />
          </div>
        )}

        {/* Gallery Section */}
        {galleryImages.length > 0 && (
          <div className={styles.previewSection}>
            <TourGallery images={galleryImages} />
          </div>
        )}

        {/* Featured Info Section */}
        {featuredInfoItems.length > 0 && (
          <div className={styles.previewSection}>
            <TourFeaturedInfo items={featuredInfoItems} />
          </div>
        )}

        {/* Timeline Section */}
        {timelineItems.length > 0 && (
          <div className={styles.previewSection}>
            <TourTimeline
              items={timelineItems}
              importantNote={tourData.timelineImportantNote || undefined}
            />
          </div>
        )}

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <div className={styles.previewSection}>
            <Testimonials testimonials={testimonials} />
          </div>
        )}

        {/* Empty state si no hay contenido */}
        {!tourData.longDescription && 
         !tourData.shortDescription && 
         galleryImages.length === 0 && 
         featuredInfoItems.length === 0 && 
         timelineItems.length === 0 && (
          <div className={styles.emptyContent}>
            <p>Agrega contenido al tour para ver la vista previa completa.</p>
          </div>
        )}
      </div>
    </div>
  );
}
