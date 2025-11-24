/**
 * Script para eliminar tours y crear nuevos tours
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando gestión de tours...");

  // 1. Eliminar TREKKING OJO DEL ALBINO
  try {
    const trekkingAlbino = await prisma.tour.findUnique({
      where: { slug: "trekking-glaciar-ojo-de-albino" },
    });

    if (trekkingAlbino) {
      // Eliminar en cascada (Prisma manejará las relaciones)
      await prisma.tour.delete({
        where: { id: trekkingAlbino.id },
      });
      console.log("✅ Tour eliminado: TREKKING GLACIAR OJO DE ALBINO");
    } else {
      console.log("⚠️  Tour no encontrado: TREKKING GLACIAR OJO DE ALBINO");
    }
  } catch (error) {
    console.error("❌ Error eliminando tour:", error);
  }

  // 2. Crear CAMINATA HUSKY
  try {
    // Verificar si ya existe
    const existingCaminataHusky = await prisma.tour.findUnique({
      where: { slug: "caminata-husky" },
    });

    if (existingCaminataHusky) {
      console.log("⚠️  Tour ya existe: CAMINATA HUSKY");
      return;
    }

    // Crear el nuevo tour
    const caminataHusky = await prisma.tour.create({
      data: {
        slug: "caminata-husky",
        name: "CAMINATA HUSKY",
        subtitle: "Caminata con huskies en Tierra Mayor",
        category: "summer",
        difficulty: "Baja",
        durationHours: 5, // Aproximadamente de 09:00 a 14:30
        featuredImage: "/images/tours/caminata-husky/featured.jpg",
        heroImage: "/images/tours/caminata-husky/hero.jpg",
        heroSubheadline: "Disfrutá de una experiencia original con amigables huskies",
        shortDescription: "Caminata de 2 km con huskies en el Husky Park Ushuaia, ubicado en el corazón de la Reserva Natural y Paisajística Tierra Mayor. Incluye visita guiada, caminata con los perros y almuerzo en restaurante Tierra Mayor.",
        longDescription: `Disfrutá de una experiencia original con amigables huskies.

El tour se realiza en el Husky Park Ushuaia, ubicado en el corazón de la Reserva Natural y Paisajística Tierra Mayor. Los cuidadores te recibirán y comenzará la visita en el monumento que homenajea a los exploradores antárticos.

Visitarás la "EXPO exploradores", conocerás el hábitat, cuidado y entrenamiento de los perros, finalizando con el "Abrazo Husky".

Luego se colocarán los arneses a los perros y, después de recibir las instrucciones necesarias, comenzará la caminata. Los pasajeros caminarán con algunos huskies mientras otros los acompañan sueltos.

Durante la caminata recorrerán senderos de lengas, cruzarán turbales, visitarán diques de castores y realizarán paradas en distintos puntos panorámicos. Habrá tiempo para admirar el paisaje y tomar fotografías con los huskies.

El tour finaliza de regreso en el Husky Park, desde donde serán trasladados al restaurante Tierra Mayor para disfrutar de un reconfortante almuerzo.

**Régimen de alimentación:**
- Entrada: variedad de ensaladas
- Plato principal: a elegir entre cordero a la criolla, trucha en papillote, risotto o hamburguesa
- Postre: a elección
- Bebida: 1 bebida sin alcohol por persona`,
        restrictionText: "Temporada: De octubre a mayo. Dificultad baja. 2 km de caminata. Entrada Husky Park incluida.",
        isActive: true,
        minAge: 4,
        // Precios según datos del cliente: 70,000 adulto, 42,000 menor
        prices: {
          create: [
            {
              currency: "ARS",
              priceAdult: 70000,
              priceChild: 42000,
              priceInfantFree: false,
              childAgeRange: "0-11",
              childPriceType: "FULL_CHILD_PRICE",
              infantMaxAge: 3,
            },
            {
              currency: "USD",
              priceAdult: 49,
              priceChild: 29,
              priceInfantFree: false,
              childAgeRange: "0-11",
              childPriceType: "FULL_CHILD_PRICE",
              infantMaxAge: 3,
            },
          ],
        },
      },
    });

    console.log("✅ Tour creado: CAMINATA HUSKY");
    console.log(`   ID: ${caminataHusky.id}`);
    console.log(`   Slug: ${caminataHusky.slug}`);
    console.log(`   Precios: ARS 70,000 adulto / 42,000 menor | USD 49 adulto / 29 menor`);
    console.log(`   Edad mínima: 4 años`);
    console.log(`   Temporada: De octubre a mayo`);
  } catch (error) {
    console.error("❌ Error creando tour CAMINATA HUSKY:", error);
  }

  console.log("\n✅ Gestión de tours completada!");
}

main()
  .catch((e) => {
    console.error("❌ Error en gestión:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

