/**
 * Adaptadores para transformar datos de API a formatos esperados por componentes
 * Convierte respuestas de API a estructuras compatibles con componentes existentes
 */

import type {
  TourResponse,
  TourFullResponse,
  TourWithImagesResponse,
  TimelineItemResponse,
  FeaturedInfoResponse,
  TestimonialResponse,
  QuickInfoItemResponse,
} from "@/modules/tours/api/dto/toursDto";
import type { TourCardData, Tour, TourHero, TourQuickInfo, TourDescription } from "@/modules/tours/types/tourTypes";

function normalizeImageUrl(rawUrl: string | null | undefined, tourSlug?: string, isGallery = false): string {
  const value = (rawUrl || "").trim();
  if (!value) return "";

  if (value.startsWith("/")) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
      let envHost: string | null = null;
      if (envUrl) {
        try {
          envHost = new URL(envUrl).hostname;
        } catch {
          envHost = null;
        }
      }
      const sameKnownHost =
        parsed.hostname === "antartur.tur.ar" ||
        parsed.hostname === "www.antartur.tur.ar" ||
        (envHost ? parsed.hostname === envHost : false);

      if (sameKnownHost && parsed.pathname.startsWith("/images/")) {
        return `${parsed.pathname}${parsed.search || ""}`;
      }
      return value;
    } catch {
      return value;
    }
  }

  // Legacy data may store only file names; map to expected public folders.
  if (tourSlug && !value.includes("/")) {
    if (isGallery) {
      return `/images/tours/${tourSlug}/gallery/${value}`;
    }
    return `/images/tours/${tourSlug}/${value}`;
  }

  return value;
}

/**
 * Transforma TourResponse a TourCardData para ToursGrid
 */
export function toTourCardData(tour: TourResponse): TourCardData {
  // Obtener precio ARS si existe
  const arsPrice = tour.prices.find((p) => p.currency === "ARS");
  const usdPrice = tour.prices.find((p) => p.currency === "USD");

  // Formatear precio ARS para el campo legacy `price`
  const formattedPrice = arsPrice
    ? `$${Number(arsPrice.priceAdult).toLocaleString("es-AR")}`
    : undefined;

  return {
    id: tour.slug,
    featuredImage: normalizeImageUrl(tour.featuredImage, tour.slug, false),
    subtitle: tour.subtitle || "",
    title: tour.name,
    difficulty: tour.difficulty,
    price: formattedPrice, // Campo legacy para compatibilidad
    prices: {
      ARS: arsPrice
        ? {
            adult: Number(arsPrice.priceAdult),
            child: Number(arsPrice.priceChild),
          }
        : undefined,
      USD: usdPrice
        ? {
            adult: Number(usdPrice.priceAdult),
            child: Number(usdPrice.priceChild),
          }
        : undefined,
    },
    category: tour.category as "winter" | "summer",
  };
}

/**
 * Transforma TourFullResponse o TourWithImagesResponse a estructura Tour completa para páginas de detalle
 */
export function toFullTourData(tour: TourFullResponse | TourWithImagesResponse): Partial<Tour> {
  // Obtener imágenes por tipo
  const featuredImage = tour.images.find((img) => img.imageType === "FEATURED");
  const heroImage = tour.images.find((img) => img.imageType === "HERO");
  const galleryImages = tour.images
    .filter((img) => img.imageType === "GALLERY")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Obtener precios
  const arsPrice = tour.prices.find((p) => p.currency === "ARS");
  const usdPrice = tour.prices.find((p) => p.currency === "USD");

  // Transformar timeline items (solo si está disponible en TourFullResponse)
  const timelineItems =
    "timelineItems" in tour && tour.timelineItems
      ? tour.timelineItems.map((item) => ({
          id: item.id,
          timeLabel: item.timeLabel,
          title: item.title,
          description: item.description,
        }))
      : [];

  // Transformar featuredInfo items (solo si está disponible en TourFullResponse)
  const featuredInfos =
    "featuredInfos" in tour && tour.featuredInfos
      ? tour.featuredInfos.map((item) => ({
          id: item.id,
          icon: item.icon as any,
          title: item.title,
          description: item.description,
        }))
      : [];

  // Transformar testimonials (solo si está disponible en TourFullResponse)
  const testimonials =
    "testimonials" in tour && tour.testimonials
      ? tour.testimonials.map((item) => ({
          id: item.id,
          text: item.text,
          author: item.author,
          avatar: item.avatar,
          country: item.country,
        }))
      : [];

  // Transformar quickInfo items (solo si está disponible en TourFullResponse)
  const quickInfoItems =
    "quickInfoItems" in tour && tour.quickInfoItems
      ? tour.quickInfoItems.map((item) => ({
          id: item.id,
          label: item.label,
          value: item.value,
          icon: item.icon as any,
        }))
      : [];

  // Transformar availability (solo si está disponible en TourFullResponse)
  const availability =
    "availability" in tour && tour.availability
      ? tour.availability.map((avail) => ({
          date: avail.date,
          available: avail.available,
          timeSlot: {
            start: avail.startTime,
            end: avail.endTime || "",
          },
        }))
      : [];

  return {
    card: {
      id: tour.slug,
      featuredImage: normalizeImageUrl(tour.featuredImage, tour.slug, false),
      subtitle: tour.subtitle || "",
      title: tour.name,
      difficulty: tour.difficulty,
      category: tour.category as "winter" | "summer",
    },
    hero: {
      headline: tour.name,
      subheadline: tour.heroSubheadline || undefined,
      backgroundImage: normalizeImageUrl(heroImage?.url || tour.heroImage, tour.slug, false),
    },
    quickInfo: {
      price: arsPrice ? `$${Number(arsPrice.priceAdult).toLocaleString("es-AR")}` : "",
      items: quickInfoItems,
      restrictions: ("restrictions" in tour && tour.restrictions && tour.restrictions.length > 0)
        ? tour.restrictions.map((r) => r.text)
        : undefined,
      alternative: (tour.alternativeText && tour.alternativePrice && 
                    tour.alternativeText !== "Consultar precio" && 
                    tour.alternativePrice !== "Consultar")
        ? {
            text: tour.alternativeText,
            price: tour.alternativePrice,
          }
        : undefined,
      ctaLabel: tour.ctaLabel || "RESERVAR",
      ctaHref: tour.ctaHref || "#booking",
    },
    description: {
      short: tour.shortDescription,
      long: tour.longDescription.split("\n\n").filter((p) => p.trim()),
    },
    featuredInfo: featuredInfos.length > 0 ? featuredInfos : undefined,
    gallery: galleryImages.map((img) => ({
      id: img.id,
      src: normalizeImageUrl(img.url, tour.slug, true),
      alt: img.altText,
    })),
    timeline: {
      items: timelineItems,
      importantNote: tour.timelineImportantNote || undefined,
    },
    testimonials: testimonials.length > 0 ? testimonials : undefined,
    seo: {
      metaTitle: tour.metaTitle || tour.name,
      metaDescription: tour.metaDescription || tour.shortDescription,
      canonicalUrl: tour.canonicalUrl || "",
      ogImage: normalizeImageUrl(tour.ogImage || tour.featuredImage, tour.slug, false),
    },
    booking: arsPrice || usdPrice
      ? {
          pricing: arsPrice
            ? {
                priceAdult: Number(arsPrice.priceAdult),
                priceChild: Number(arsPrice.priceChild),
                currency: "ARS",
                priceInfantFree: arsPrice.priceInfantFree,
                childAgeRange: arsPrice.childAgeRange,
                childPriceType: arsPrice.childPriceType,
                infantMaxAge: arsPrice.infantMaxAge,
              }
            : {
                priceAdult: Number(usdPrice!.priceAdult),
                priceChild: Number(usdPrice!.priceChild),
                currency: "USD",
                priceInfantFree: usdPrice!.priceInfantFree,
                childAgeRange: usdPrice!.childAgeRange,
                childPriceType: usdPrice!.childPriceType,
                infantMaxAge: usdPrice!.infantMaxAge,
              },
          prices: {
            ARS: arsPrice
              ? {
                  adult: Number(arsPrice.priceAdult),
                  child: Number(arsPrice.priceChild),
                }
              : undefined,
            USD: usdPrice
              ? {
                  adult: Number(usdPrice.priceAdult),
                  child: Number(usdPrice.priceChild),
                }
              : undefined,
          },
          additionals: tour.additionals && tour.additionals.length > 0
            ? tour.additionals.map((add) => {
                const arsPrice = add.prices.find((p) => p.currency === "ARS");
                const usdPrice = add.prices.find((p) => p.currency === "USD");
                // Precio único: usar priceAdult como precio general (priceChild tiene el mismo valor)
                return {
                  id: add.id,
                  name: add.name,
                  description: add.description,
                  prices: {
                    ARS: arsPrice
                      ? {
                          adult: Number(arsPrice.priceAdult), // Precio único
                          child: Number(arsPrice.priceAdult), // Mismo precio (precio único)
                        }
                      : undefined,
                    USD: usdPrice
                      ? {
                          adult: Number(usdPrice.priceAdult), // Precio único
                          child: Number(usdPrice.priceAdult), // Mismo precio (precio único)
                        }
                      : undefined,
                  },
                };
              })
            : undefined,
          availability,
        }
      : undefined,
    restrictions: {
      minAge: tour.minAge,
      minPassengers: tour.minPassengers,
      allowsInfants: tour.allowsInfants ?? false,
    },
  };
}

