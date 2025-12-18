/**
 * Servicio de dominio para Tours
 * Contiene toda la lógica de negocio para tours
 */

import { TourRepository } from "../infra/tourRepository";
import { TourRestrictionRepository } from "../infra/tourRestrictionRepository";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { normalizePagination, calculatePaginationMeta } from "@/lib/api/response";
import { prisma } from "@/lib/db";
import type { ListToursQuery, CreateTourInput, UpdateTourInput } from "../api/validators/toursValidators";

const tourRepository = new TourRepository();
const restrictionRepository = new TourRestrictionRepository();

export class TourService {
  /**
   * Listar tours con filtros y paginación
   */
  async listTours(query: ListToursQuery) {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    // Construir where clause para filtros
    const where: Record<string, unknown> = {};
    if (query.category) {
      where.category = query.category;
    }
    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { subtitle: { contains: query.search, mode: "insensitive" } },
        { shortDescription: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Obtener tours con paginación
    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        skip,
        take: limit,
        orderBy: query.sortBy
          ? { [query.sortBy]: query.sortOrder || "asc" }
          : { createdAt: "desc" },
        include: {
          images: true,
          prices: true,
          additionals: {
            where: { isActive: true },
            include: {
              prices: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
      prisma.tour.count({ where }),
    ]);

    const meta = calculatePaginationMeta(page, limit, total);
    return { data: tours, meta };
  }

  /**
   * Obtener tour por ID
   */
  async getTourById(id: string, includeAvailability = false, includeContent = false) {
    const tour = await tourRepository.findById(id, true, includeAvailability, true, true, includeContent);

    if (!tour) {
      throw new NotFoundError("Tour", id);
    }

    return tour;
  }

  /**
   * Obtener tour por slug
   */
  async getTourBySlug(
    slug: string,
    includeImages = true,
    includeDepartures = false,
    includePrices = true,
    includeContent = false
  ) {
    const tour = await tourRepository.findBySlug(
      slug,
      includeImages,
      includeDepartures,
      includePrices,
      true, // includeAdditionals
      includeContent
    );

    if (!tour) {
      throw new NotFoundError("Tour", slug);
    }

    return tour;
  }

  /**
   * Crear nuevo tour
   */
  async createTour(data: CreateTourInput) {
    // Validación de negocio: verificar que el slug no exista
    const existingTour = await tourRepository.findBySlug(data.slug);
    if (existingTour) {
      throw new ValidationError("Tour with this slug already exists", { slug: data.slug });
    }

    const tour = await tourRepository.create(data);
    
    // Obtener tour completo con precios para la respuesta
    const tourWithPrices = await tourRepository.findById(tour.id, false, false, true);
    if (!tourWithPrices) {
      throw new NotFoundError("Tour", tour.id);
    }
    
    return tourWithPrices;
  }

  /**
   * Actualizar tour existente
   */
  async updateTour(id: string, data: UpdateTourInput) {
    // Verificar que el tour existe
    const existingTour = await tourRepository.findById(id);
    if (!existingTour) {
      throw new NotFoundError("Tour", id);
    }

    // Validación de negocio: si se actualiza el slug, verificar que no exista otro tour con ese slug
    if (data.slug && data.slug !== existingTour.slug) {
      const slugExists = await tourRepository.findBySlug(data.slug);
      if (slugExists) {
        throw new ValidationError("Tour with this slug already exists", { slug: data.slug });
      }
    }

    // Separar campos de relaciones de campos del tour
    const { 
      images, 
      timelineItems, 
      featuredInfos, 
      testimonials, 
      quickInfoItems,
      restrictions,
      prices,
      additionals,
      ...tourFields 
    } = data;

    // Usar una transacción para actualizar todo
    await prisma.$transaction(async (tx) => {
      // 1. Actualizar campos del tour
      if (Object.keys(tourFields).length > 0) {
        await tx.tour.update({
          where: { id },
          data: tourFields,
        });
      }

      // 2. Actualizar imágenes si se proporcionan
      if (images !== undefined) {
        // Eliminar imágenes existentes
        await tx.tourImage.deleteMany({ where: { tourId: id } });
        // Crear nuevas imágenes
        if (images.length > 0) {
          await tx.tourImage.createMany({
            data: images.map((img, index) => ({
              tourId: id,
              imageType: img.imageType as "FEATURED" | "HERO" | "GALLERY",
              url: img.url,
              altText: img.altText,
              sortOrder: img.sortOrder ?? index,
            })),
          });
        }
      }

      // 3. Actualizar timeline items si se proporcionan
      if (timelineItems !== undefined) {
        await tx.tourTimelineItem.deleteMany({ where: { tourId: id } });
        if (timelineItems.length > 0) {
          await tx.tourTimelineItem.createMany({
            data: timelineItems.map((item, index) => ({
              tourId: id,
              timeLabel: item.timeLabel,
              title: item.title,
              description: item.description,
              sortOrder: item.sortOrder ?? index,
            })),
          });
        }
      }

      // 4. Actualizar featured infos si se proporcionan
      if (featuredInfos !== undefined) {
        await tx.tourFeaturedInfo.deleteMany({ where: { tourId: id } });
        if (featuredInfos.length > 0) {
          await tx.tourFeaturedInfo.createMany({
            data: featuredInfos.map((item, index) => ({
              tourId: id,
              icon: item.icon,
              title: item.title,
              description: item.description,
              sortOrder: item.sortOrder ?? index,
            })),
          });
        }
      }

      // 5. Actualizar testimonials si se proporcionan
      if (testimonials !== undefined) {
        await tx.tourTestimonial.deleteMany({ where: { tourId: id } });
        if (testimonials.length > 0) {
          await tx.tourTestimonial.createMany({
            data: testimonials.map((item, index) => ({
              tourId: id,
              text: item.text,
              author: item.author,
              avatar: item.avatar,
              country: item.country,
              sortOrder: item.sortOrder ?? index,
            })),
          });
        }
      }

      // 6. Actualizar quick info items si se proporcionan
      if (quickInfoItems !== undefined) {
        await tx.tourQuickInfoItem.deleteMany({ where: { tourId: id } });
        if (quickInfoItems.length > 0) {
          await tx.tourQuickInfoItem.createMany({
            data: quickInfoItems.map((item, index) => ({
              tourId: id,
              icon: item.icon,
              label: item.label,
              value: item.value,
              sortOrder: item.sortOrder ?? index,
            })),
          });
        }
      }

      // 7. Actualizar restricciones si se proporcionan
      if (restrictions !== undefined) {
        // Eliminar restricciones existentes
        await tx.tourRestriction.deleteMany({ where: { tourId: id } });
        // Crear nuevas restricciones
        if (restrictions.length > 0) {
          await tx.tourRestriction.createMany({
            data: restrictions.map((item, index) => ({
              tourId: id,
              text: item.text,
              sortOrder: item.sortOrder ?? index,
            })),
          });
        }
      }

      // 8. Actualizar precios si se proporcionan
      if (prices !== undefined) {
        // Obtener currencies del payload
        const incomingCurrencies = prices.map(p => p.currency);
        
        // Eliminar currencies que no están en el payload
        await tx.tourPrice.deleteMany({
          where: {
            tourId: id,
            currency: {
              notIn: incomingCurrencies,
            },
          },
        });

        // Crear o actualizar precios del payload
        for (const price of prices) {
          // Buscar precio existente por currency
          const existingPrice = await tx.tourPrice.findFirst({
            where: {
              tourId: id,
              currency: price.currency,
            },
          });

          if (existingPrice) {
            // Actualizar precio existente
            await tx.tourPrice.update({
              where: { id: existingPrice.id },
              data: {
                priceAdult: price.priceAdult,
                priceChild: price.priceChild,
              },
            });
          } else {
            // Crear nuevo precio
            await tx.tourPrice.create({
              data: {
                tourId: id,
                currency: price.currency,
                priceAdult: price.priceAdult,
                priceChild: price.priceChild,
              },
            });
          }
        }
      }

      // 9. Actualizar additionals si se proporcionan
      if (additionals !== undefined) {
        // Obtener IDs de additionals existentes que se están actualizando
        const existingAdditionalIds = additionals
          .filter(a => a.id && !a.id.startsWith("temp-"))
          .map(a => a.id!);
        
        // Eliminar additionals que no están en el payload (y sus precios)
        await tx.tourAdditionalPrice.deleteMany({
          where: {
            tourAdditional: {
              tourId: id,
              id: {
                notIn: existingAdditionalIds.length > 0 ? existingAdditionalIds : [],
              },
            },
          },
        });
        await tx.tourAdditional.deleteMany({
          where: {
            tourId: id,
            id: {
              notIn: existingAdditionalIds.length > 0 ? existingAdditionalIds : [],
            },
          },
        });

        // Crear o actualizar additionals del payload
        for (const additional of additionals) {
          if (additional.id && !additional.id.startsWith("temp-")) {
            // Actualizar additional existente
            const updatedAdditional = await tx.tourAdditional.update({
              where: { id: additional.id },
              data: {
                name: additional.name,
                description: additional.description ?? null,
                isActive: additional.isActive ?? true,
                sortOrder: additional.sortOrder ?? 0,
              },
            });

            // Eliminar precios existentes del additional
            await tx.tourAdditionalPrice.deleteMany({
              where: { tourAdditionalId: additional.id },
            });

            // Crear nuevos precios (mapear price general a priceAdult, priceChild igual)
            if (additional.prices && additional.prices.length > 0) {
              await tx.tourAdditionalPrice.createMany({
                data: additional.prices.map(price => ({
                  tourAdditionalId: updatedAdditional.id,
                  currency: price.currency,
                  priceAdult: price.price,
                  priceChild: price.price, // Precio general aplica a todos
                })),
              });
            }
          } else {
            // Crear nuevo additional
            const newAdditional = await tx.tourAdditional.create({
              data: {
                tourId: id,
                name: additional.name,
                description: additional.description ?? null,
                isActive: additional.isActive ?? true,
                sortOrder: additional.sortOrder ?? 0,
              },
            });

            // Crear precios del additional (mapear price general a priceAdult, priceChild igual)
            if (additional.prices && additional.prices.length > 0) {
              await tx.tourAdditionalPrice.createMany({
                data: additional.prices.map(price => ({
                  tourAdditionalId: newAdditional.id,
                  currency: price.currency,
                  priceAdult: price.price,
                  priceChild: price.price, // Precio general aplica a todos
                })),
              });
            }
          }
        }
      }
    });
    
    // Obtener tour completo con todas las relaciones para la respuesta
    const tourComplete = await tourRepository.findById(id, true, false, true, true, true);
    if (!tourComplete) {
      throw new NotFoundError("Tour", id);
    }
    
    return tourComplete;
  }

  /**
   * Eliminar tour
   */
  async deleteTour(id: string) {
    const tour = await tourRepository.findById(id);
    if (!tour) {
      throw new NotFoundError("Tour", id);
    }

    // Validaciones de negocio: verificar dependencias antes de eliminar
    // (esto se puede expandir en el futuro para verificar bookings, etc.)
    
    await tourRepository.delete(id);
  }
}

