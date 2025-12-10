/**
 * Script de migración de tours desde JSON mockup a base de datos
 * Migra todos los datos: tours básicos, precios, imágenes, timeline, featuredInfo, testimonials, SEO
 */

import { PrismaClient } from "@prisma/client";
// Estos archivos fueron eliminados después de migrar a la base de datos
// Si necesitas ejecutar este script nuevamente, restaura los archivos JSON primero
// import toursDataJson from "../src/modules/tours/components/ToursGrid/toursData.json";
// import tourExampleJson from "../src/modules/tours/components/ToursGrid/tourExample.json";
import type { Tour as MockupTour } from "../src/modules/tours/types/tourTypes";

const prisma = new PrismaClient();

interface TourCardData {
  id: string;
  featuredImage: string;
  subtitle: string;
  title: string;
  difficulty: string;
  price?: string;
  prices?: {
    ARS?: { adult: number; child: number };
    USD?: { adult: number; child: number };
  };
  category: "winter" | "summer";
}

/**
 * Extrae durationHours desde quickInfo.items buscando el item con icon "clock"
 */
function extractDurationHours(quickInfoItems?: Array<{ icon: string; value: string }>): number {
  if (!quickInfoItems) return 4; // Default

  const durationItem = quickInfoItems.find((item) => item.icon === "clock");
  if (!durationItem) return 4;

  // Extraer número de strings como "7 horas", "4 horas", etc.
  const match = durationItem.value.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 4;
}

/**
 * Normaliza dificultad a formato consistente
 */
function normalizeDifficulty(difficulty: string): string {
  const upper = difficulty.toUpperCase();
  if (upper.includes("ALTA") || upper.includes("HIGH")) return "Alta";
  if (upper.includes("MEDIA") || upper.includes("MEDIUM")) return "Media";
  if (upper.includes("BAJA") || upper.includes("LOW")) return "Baja";
  return difficulty; // Mantener original si no coincide
}

/**
 * Normaliza formato de hora de "9:00 am" a "09:00"
 */
function normalizeTime(time: string): string {
  if (!time) return "09:00";

  // Remover espacios y convertir a minúsculas
  const cleaned = time.trim().toLowerCase();

  // Si ya está en formato HH:mm, retornar
  if (/^\d{2}:\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // Parsear formato "9:00 am" o "9:00am"
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
  if (!match) return "09:00";

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3];

  if (period === "pm" && hours !== 12) {
    hours += 12;
  } else if (period === "am" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

async function main() {
  console.log("🌱 Iniciando migración de tours...");

  // const toursData = toursDataJson as Record<string, TourCardData>;
  // const toursFullData = tourExampleJson as Record<string, MockupTour>;
  const toursData = {} as Record<string, TourCardData>; // Empty - migration already completed
  const toursFullData = {} as Record<string, MockupTour>; // Empty - migration already completed

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const [tourId, tourCard] of Object.entries(toursData)) {
    try {
      const fullTour = toursFullData[tourId];
      const slug = tourId;

      // Verificar si el tour ya existe
      const existing = await prisma.tour.findUnique({
        where: { slug },
      });

      if (existing) {
        console.log(`⏭️  Tour ${slug} ya existe, saltando...`);
        skipped++;
        continue;
      }

      // Obtener datos completos si existen
      const hero = fullTour?.hero;
      const quickInfo = fullTour?.quickInfo;
      const description = fullTour?.description;
      const timeline = fullTour?.timeline;
      const featuredInfo = fullTour?.featuredInfo;
      const testimonials = fullTour?.testimonials;
      const seo = fullTour?.seo;
      const gallery = fullTour?.gallery || [];
      const booking = fullTour?.booking;

      // Extraer durationHours
      const durationHours = extractDurationHours(quickInfo?.items);

      // Tomar restricciones como texto legacy
      const restrictionText =
        quickInfo?.restrictions && quickInfo.restrictions.length > 0
          ? quickInfo.restrictions.join(". ")
          : "";

      // Crear tour básico
      const tour = await prisma.tour.create({
        data: {
          slug,
          name: tourCard.title,
          subtitle: tourCard.subtitle,
          category: tourCard.category,
          difficulty: normalizeDifficulty(tourCard.difficulty),
          durationHours,
          featuredImage: tourCard.featuredImage,
          heroImage: hero?.backgroundImage || tourCard.featuredImage,
          heroSubheadline: hero?.subheadline,
          shortDescription: description?.short || tourCard.subtitle || "",
          longDescription: description?.long?.join("\n\n") || "",
          restrictionText,
          isActive: true,
          // SEO
          metaTitle: seo?.metaTitle,
          metaDescription: seo?.metaDescription,
          canonicalUrl: seo?.canonicalUrl,
          ogImage: seo?.ogImage,
          // QuickInfo CTA
          ctaLabel: quickInfo?.ctaLabel,
          ctaHref: quickInfo?.ctaHref,
          // Alternative pricing
          alternativeText: quickInfo?.alternative?.text,
          alternativePrice: quickInfo?.alternative?.price,
          // Timeline note
          timelineImportantNote: timeline?.importantNote,
        },
      });

      // Crear precios ARS y USD
      if (tourCard.prices) {
        const pricesToCreate = [];

        if (tourCard.prices.ARS) {
          pricesToCreate.push({
            tourId: tour.id,
            currency: "ARS",
            priceAdult: tourCard.prices.ARS.adult,
            priceChild: tourCard.prices.ARS.child,
          });
        }

        if (tourCard.prices.USD) {
          pricesToCreate.push({
            tourId: tour.id,
            currency: "USD",
            priceAdult: tourCard.prices.USD.adult,
            priceChild: tourCard.prices.USD.child,
          });
        }

        if (pricesToCreate.length > 0) {
          await prisma.tourPrice.createMany({
            data: pricesToCreate,
          });
        }
      }

      // Crear imágenes
      const imagesToCreate = [];

      // Featured image
      imagesToCreate.push({
        tourId: tour.id,
        imageType: "FEATURED" as const,
        url: tourCard.featuredImage,
        altText: tourCard.title,
        sortOrder: 0,
      });

      // Hero image (si es diferente)
      if (hero?.backgroundImage && hero.backgroundImage !== tourCard.featuredImage) {
        imagesToCreate.push({
          tourId: tour.id,
          imageType: "HERO" as const,
          url: hero.backgroundImage,
          altText: `${tourCard.title} - Hero`,
          sortOrder: 1,
        });
      }

      // Gallery images
      gallery.forEach((img, index) => {
        imagesToCreate.push({
          tourId: tour.id,
          imageType: "GALLERY" as const,
          url: img.src,
          altText: img.alt || `${tourCard.title} - Imagen ${index + 1}`,
          sortOrder: index + 2,
        });
      });

      if (imagesToCreate.length > 0) {
        await prisma.tourImage.createMany({
          data: imagesToCreate,
        });
      }

      // Crear QuickInfo items
      if (quickInfo?.items && quickInfo.items.length > 0) {
        await prisma.tourQuickInfoItem.createMany({
          data: quickInfo.items.map((item, index) => ({
            tourId: tour.id,
            icon: item.icon,
            label: item.label || "",
            value: item.value,
            sortOrder: index,
          })),
        });
      }

      // Crear Timeline items
      if (timeline?.items && timeline.items.length > 0) {
        await prisma.tourTimelineItem.createMany({
          data: timeline.items.map((item, index) => ({
            tourId: tour.id,
            timeLabel: item.timeLabel,
            title: item.title,
            description: item.description,
            sortOrder: index,
          })),
        });
      }

      // Crear FeaturedInfo items
      if (featuredInfo && featuredInfo.length > 0) {
        await prisma.tourFeaturedInfo.createMany({
          data: featuredInfo.map((item, index) => ({
            tourId: tour.id,
            icon: item.icon,
            title: item.title,
            description: item.description,
            sortOrder: index,
          })),
        });
      }

      // Crear Testimonials
      if (testimonials && testimonials.length > 0) {
        await prisma.tourTestimonial.createMany({
          data: testimonials.map((testimonial, index) => ({
            tourId: tour.id,
            text: testimonial.text,
            author: testimonial.author,
            avatar: testimonial.avatar,
            country: testimonial.country,
            sortOrder: index,
          })),
        });
      }

      migrated++;
      console.log(`✅ Migrado tour: ${slug} (${tourCard.title})`);
    } catch (error) {
      errors++;
      console.error(`❌ Error migrando tour ${tourId}:`, error);
    }
  }

  console.log("\n📊 Resumen de migración:");
  console.log(`✅ Migrados: ${migrated}`);
  console.log(`⏭️  Saltados: ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
}

main()
  .catch((e) => {
    console.error("❌ Error en migración:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

