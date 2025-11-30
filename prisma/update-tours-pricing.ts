/**
 * Script para actualizar tours con nuevos precios, restricciones y additionals
 * Basado en los datos proporcionados por el cliente
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TourUpdate {
  slug: string;
  name: string;
  prices: {
    ARS: { adult: number; child: number };
    USD: { adult: number; child: number };
  };
  minAge?: number;
  minPassengers?: number;
  priceInfantFree?: boolean;
  childAgeRange?: string;
  childPriceType?: "FULL_CHILD_PRICE" | "HALF_ADULT_PRICE" | "ADULT_PRICE";
  additionals?: Array<{
    name: string;
    description?: string;
    prices: {
      ARS: { adult: number; child: number };
      USD: { adult: number; child: number };
    };
  }>;
}

// Datos de los tours según la información del cliente
const toursData: TourUpdate[] = [
  {
    slug: "lagos-off-road",
    name: "LAGOS OFF ROAD",
    prices: {
      ARS: { adult: 180000, child: 108000 },
      USD: { adult: 127, child: 77 },
    },
    minAge: 2,
    priceInfantFree: false,
    childAgeRange: "0-11", // De 0 a 11 años pagan precio menor
    childPriceType: "FULL_CHILD_PRICE",
    additionals: [
      {
        name: "Con Canoas",
        description: "Agregar canoas al tour Lagos Off Road",
        prices: {
          ARS: { adult: 30000, child: 18000 }, // Diferencia: 210000-180000 y 126000-108000
          USD: { adult: 22, child: 13 }, // Diferencia aproximada basada en tasa
        },
      },
    ],
  },
  {
    slug: "parque-trekking-canoas",
    name: "PARQUE TREKKING & CANOAS",
    prices: {
      ARS: { adult: 180000, child: 108000 },
      USD: { adult: 127, child: 77 },
    },
    minAge: 10,
    priceInfantFree: false,
    childAgeRange: "0-11",
    childPriceType: "FULL_CHILD_PRICE",
  },
  {
    slug: "parque-aventura",
    name: "PARQUE AVENTURA",
    prices: {
      ARS: { adult: 150000, child: 90000 },
      USD: { adult: 106, child: 64 },
    },
    minAge: 10,
    minPassengers: 4,
    priceInfantFree: false,
    childAgeRange: "0-11",
    childPriceType: "FULL_CHILD_PRICE",
  },
  {
    slug: "trekking-laguna-esmeralda",
    name: "TREKKING LAGUNA ESMERALDA",
    prices: {
      ARS: { adult: 130000, child: 78000 },
      USD: { adult: 113, child: 68 },
    },
    minAge: 10,
    priceInfantFree: false,
    childAgeRange: "0-11",
    childPriceType: "FULL_CHILD_PRICE",
  },
  {
    slug: "trekking-glaciar-vinciguerra",
    name: "TREKKING GLACIAR VINCIGUERRA",
    prices: {
      ARS: { adult: 200000, child: 120000 },
      USD: { adult: 141, child: 85 },
    },
    minAge: 15,
    priceInfantFree: false,
    childAgeRange: "0-11",
    childPriceType: "FULL_CHILD_PRICE",
  },
  {
    slug: "experiencia-husky",
    name: "EXPERIENCIA HUSKY",
    prices: {
      ARS: { adult: 140000, child: 84000 },
      USD: { adult: 99, child: 59 },
    },
    minAge: 4,
    minPassengers: 2,
    priceInfantFree: false,
    childAgeRange: "0-11",
    childPriceType: "FULL_CHILD_PRICE",
  },
  {
    slug: "parque-nacional-clasico",
    name: "PARQUE NACIONAL CLÁSICO",
    prices: {
      ARS: { adult: 90000, child: 45000 },
      USD: { adult: 64, child: 32 },
    },
    minAge: 4,
    priceInfantFree: true, // 0-3 años gratis
    childAgeRange: "4-11", // Solo 4-11 años pagan 50%
    childPriceType: "HALF_ADULT_PRICE", // 50% del precio adulto
  },
  {
    slug: "canal-beagle-catamaran",
    name: "CANAL BEAGLE EN CATAMARAN",
    prices: {
      ARS: { adult: 100000, child: 50000 },
      USD: { adult: 71, child: 35 },
    },
    priceInfantFree: true, // 0-3 años gratis
    childAgeRange: "4-11", // Solo 4-11 años pagan 50%
    childPriceType: "HALF_ADULT_PRICE",
  },
  {
    slug: "pinguinera-isla-martillo",
    name: "PINGUINERA ISLA MARTILLO",
    prices: {
      ARS: { adult: 165000, child: 82500 },
      USD: { adult: 117, child: 59 },
    },
    priceInfantFree: true, // 0-3 años gratis
    childAgeRange: "4-11", // Solo 4-11 años pagan 50%
    childPriceType: "HALF_ADULT_PRICE",
  },
];

async function main() {
  console.log("🔄 Iniciando actualización de tours con nuevos precios y restricciones...");

  for (const tourData of toursData) {
    try {
      console.log(`\n📝 Procesando: ${tourData.name} (${tourData.slug})`);

      // Buscar el tour
      const tour = await prisma.tour.findUnique({
        where: { slug: tourData.slug },
        include: { prices: true, additionals: true },
      });

      if (!tour) {
        console.log(`⚠️  Tour no encontrado: ${tourData.slug}`);
        continue;
      }

      // Actualizar campos del tour
      const updateData: any = {};
      if (tourData.minAge !== undefined) updateData.minAge = tourData.minAge;
      if (tourData.minPassengers !== undefined) updateData.minPassengers = tourData.minPassengers;

      if (Object.keys(updateData).length > 0) {
        await prisma.tour.update({
          where: { id: tour.id },
          data: updateData,
        });
        console.log(`  ✅ Actualizado: minAge=${tourData.minAge || "null"}, minPassengers=${tourData.minPassengers || "null"}`);
      }

      // Actualizar precios
      for (const [currency, prices] of Object.entries(tourData.prices)) {
        const existingPrice = tour.prices.find((p) => p.currency === currency);

        const priceData: any = {
          priceAdult: prices.adult,
          priceChild: prices.child,
          priceInfantFree: tourData.priceInfantFree ?? false,
          childAgeRange: tourData.childAgeRange || null,
          childPriceType: tourData.childPriceType || "FULL_CHILD_PRICE",
          infantMaxAge: 3,
        };

        if (existingPrice) {
          await prisma.tourPrice.update({
            where: { id: existingPrice.id },
            data: priceData,
          });
          console.log(`  ✅ Precio ${currency} actualizado: Adulto=${prices.adult}, Menor=${prices.child}`);
        } else {
          await prisma.tourPrice.create({
            data: {
              tourId: tour.id,
              currency,
              ...priceData,
            },
          });
          console.log(`  ✅ Precio ${currency} creado: Adulto=${prices.adult}, Menor=${prices.child}`);
        }
      }

      // Crear/actualizar additionals
      if (tourData.additionals && tourData.additionals.length > 0) {
        for (const additionalData of tourData.additionals) {
          // Verificar si ya existe
          let additional = tour.additionals.find((a) => a.name === additionalData.name);

          if (!additional) {
            // Crear nuevo additional
            additional = await prisma.tourAdditional.create({
              data: {
                tourId: tour.id,
                name: additionalData.name,
                description: additionalData.description || null,
                isActive: true,
                sortOrder: 0,
              },
            });
            console.log(`  ✅ Additional creado: ${additionalData.name}`);
          } else {
            // Actualizar si existe
            await prisma.tourAdditional.update({
              where: { id: additional.id },
              data: {
                description: additionalData.description || null,
                isActive: true,
              },
            });
            console.log(`  ✅ Additional actualizado: ${additionalData.name}`);
          }

          // Crear/actualizar precios del additional
          for (const [currency, prices] of Object.entries(additionalData.prices)) {
            const existingAdditionalPrice = await prisma.tourAdditionalPrice.findUnique({
              where: {
                tourAdditionalId_currency: {
                  tourAdditionalId: additional.id,
                  currency,
                },
              },
            });

            if (existingAdditionalPrice) {
              await prisma.tourAdditionalPrice.update({
                where: { id: existingAdditionalPrice.id },
                data: {
                  priceAdult: prices.adult,
                  priceChild: prices.child,
                },
              });
              console.log(`    ✅ Precio ${currency} del additional actualizado`);
            } else {
              await prisma.tourAdditionalPrice.create({
                data: {
                  tourAdditionalId: additional.id,
                  currency,
                  priceAdult: prices.adult,
                  priceChild: prices.child,
                },
              });
              console.log(`    ✅ Precio ${currency} del additional creado`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error procesando ${tourData.name}:`, error);
    }
  }

  console.log("\n✅ Actualización completada!");
}

main()
  .catch((e) => {
    console.error("❌ Error en actualización:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

