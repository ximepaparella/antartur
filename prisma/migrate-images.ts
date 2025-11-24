/**
 * Script de migración de rutas de imágenes
 * Actualiza las rutas de imágenes en la base de datos para que apunten a las imágenes
 * en public/images/tours/[slug]/
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * Verifica si existe un archivo en el sistema de archivos
 */
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Encuentra la extensión correcta (.jpg o .jpeg) para una imagen
 */
function findImageFile(basePath: string, baseName: string): string | null {
  const jpgPath = `${basePath}/${baseName}.jpg`;
  const jpegPath = `${basePath}/${baseName}.jpeg`;

  if (fileExists(jpgPath)) {
    return `${baseName}.jpg`;
  }
  if (fileExists(jpegPath)) {
    return `${baseName}.jpeg`;
  }
  return null;
}

/**
 * Obtiene todas las imágenes de la galería de un tour
 */
function getGalleryImages(tourDir: string): string[] {
  const galleryDir = path.join(tourDir, "gallery");
  if (!fileExists(galleryDir)) {
    return [];
  }

  try {
    const files = fs.readdirSync(galleryDir);
    // Filtrar solo archivos de imagen y ordenar numéricamente
    const imageFiles = files
      .filter((file) => /\.(jpg|jpeg)$/i.test(file))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      });

    return imageFiles.map((file) => `gallery/${file}`);
  } catch {
    return [];
  }
}

async function main() {
  console.log("🖼️  Iniciando migración de rutas de imágenes...");

  const toursDir = path.join(process.cwd(), "public", "images", "tours");

  if (!fileExists(toursDir)) {
    console.error(`❌ Directorio de tours no encontrado: ${toursDir}`);
    process.exit(1);
  }

  // Obtener todos los tours de la base de datos
  const tours = await prisma.tour.findMany({
    include: {
      images: true,
    },
  });

  console.log(`📋 Encontrados ${tours.length} tours en la base de datos`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const tour of tours) {
    try {
      const tourSlug = tour.slug;
      const tourDir = path.join(toursDir, tourSlug);

      if (!fileExists(tourDir)) {
        console.log(`⏭️  Directorio no encontrado para tour ${tourSlug}, saltando...`);
        skipped++;
        continue;
      }

      const baseImagePath = `/images/tours/${tourSlug}`;
      let hasChanges = false;

      // 1. Actualizar featuredImage en el modelo Tour
      const featuredFile = findImageFile(tourDir, "featured");
      if (featuredFile) {
        const newFeaturedPath = `${baseImagePath}/${featuredFile}`;
        if (tour.featuredImage !== newFeaturedPath) {
          await prisma.tour.update({
            where: { id: tour.id },
            data: { featuredImage: newFeaturedPath },
          });
          console.log(`  ✅ Actualizado featuredImage: ${newFeaturedPath}`);
          hasChanges = true;
        }
      } else {
        console.log(`  ⚠️  No se encontró featured.jpg/jpeg para ${tourSlug}`);
      }

      // 2. Actualizar heroImage en el modelo Tour
      const heroFile = findImageFile(tourDir, "hero");
      if (heroFile) {
        const newHeroPath = `${baseImagePath}/${heroFile}`;
        if (tour.heroImage !== newHeroPath) {
          await prisma.tour.update({
            where: { id: tour.id },
            data: { heroImage: newHeroPath },
          });
          console.log(`  ✅ Actualizado heroImage: ${newHeroPath}`);
          hasChanges = true;
        }
      } else {
        console.log(`  ⚠️  No se encontró hero.jpg/jpeg para ${tourSlug}`);
      }

      // 3. Actualizar imágenes en TourImage
      // Primero, eliminar todas las imágenes existentes y recrearlas con las rutas correctas
      const existingImages = tour.images || [];
      
      // Obtener imágenes de la galería del sistema de archivos
      const galleryFiles = getGalleryImages(tourDir);
      
      // Preparar nuevas imágenes
      const imagesToCreate: Array<{
        tourId: string;
        imageType: "FEATURED" | "HERO" | "GALLERY";
        url: string;
        altText: string;
        sortOrder: number;
      }> = [];

      // Featured image en TourImage
      if (featuredFile) {
        imagesToCreate.push({
          tourId: tour.id,
          imageType: "FEATURED",
          url: `${baseImagePath}/${featuredFile}`,
          altText: tour.name,
          sortOrder: 0,
        });
      }

      // Hero image en TourImage
      if (heroFile) {
        imagesToCreate.push({
          tourId: tour.id,
          imageType: "HERO",
          url: `${baseImagePath}/${heroFile}`,
          altText: `${tour.name} - Hero`,
          sortOrder: 1,
        });
      }

      // Gallery images
      galleryFiles.forEach((file, index) => {
        imagesToCreate.push({
          tourId: tour.id,
          imageType: "GALLERY",
          url: `${baseImagePath}/${file}`,
          altText: `${tour.name} - Imagen ${index + 1}`,
          sortOrder: index + 2,
        });
      });

      // Eliminar imágenes existentes y crear nuevas
      if (imagesToCreate.length > 0) {
        await prisma.tourImage.deleteMany({
          where: { tourId: tour.id },
        });

        await prisma.tourImage.createMany({
          data: imagesToCreate,
        });

        console.log(`  ✅ Actualizadas ${imagesToCreate.length} imágenes en TourImage`);
        hasChanges = true;
      }

      if (hasChanges) {
        updated++;
        console.log(`✅ Tour ${tourSlug} actualizado`);
      } else {
        console.log(`⏭️  Tour ${tourSlug} ya está actualizado`);
        skipped++;
      }
    } catch (error) {
      errors++;
      console.error(`❌ Error procesando tour ${tour.slug}:`, error);
    }
  }

  console.log("\n📊 Resumen de migración:");
  console.log(`✅ Actualizados: ${updated}`);
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

