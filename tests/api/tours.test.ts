/**
 * Tests para endpoints de Tours
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ToursController } from "@/modules/tours/api/controllers/toursController";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";

describe("ToursController", () => {
  let controller: ToursController;

  beforeEach(() => {
    controller = new ToursController();
  });

  afterEach(async () => {
    // Limpiar datos de test si es necesario
    await prisma.$disconnect();
  });

  describe("getById", () => {
    it("should throw NotFoundError for non-existent tour", async () => {
      await expect(controller.getById("non-existent-id")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getBySlug", () => {
    it("should throw NotFoundError for non-existent slug", async () => {
      await expect(controller.getBySlug("non-existent-slug")).rejects.toThrow(NotFoundError);
    });
  });

  describe("create", () => {
    it("should throw ValidationError for duplicate slug", async () => {
      // Verificar que la moneda existe primero
      const currency = await prisma.currency.findUnique({ where: { code: "ARS" } });
      if (!currency) {
        await prisma.currency.create({
          data: {
            code: "ARS",
            name: "Peso Argentino",
            symbol: "$",
            isDefault: true,
          },
        });
      }

      // Primero crear un tour
      const tourData = {
        slug: `test-duplicate-slug-${Date.now()}`,
        name: "Test Tour",
        category: "summer",
        difficulty: "Baja",
        durationHours: 4,
        baseCurrency: "ARS",
        basePriceAdult: 100000,
        basePriceChild: 50000,
        featuredImage: "/images/test.jpg",
        heroImage: "/images/test-hero.jpg",
        shortDescription: "Short desc",
        longDescription: "Long desc",
        restrictionText: "",
        isActive: true,
      };

      await controller.create(tourData);

      // Intentar crear otro con el mismo slug
      await expect(controller.create(tourData)).rejects.toThrow(ValidationError);

      // Limpiar: eliminar el tour creado
      const createdTour = await prisma.tour.findUnique({ where: { slug: tourData.slug } });
      if (createdTour) {
        await prisma.tour.delete({ where: { id: createdTour.id } });
      }
    });
  });
});

