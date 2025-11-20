/**
 * Tests para endpoints de Availability
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AvailabilityController } from "@/modules/departures/api/controllers/availabilityController";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";

describe("AvailabilityController", () => {
  let controller: AvailabilityController;

  beforeEach(() => {
    controller = new AvailabilityController();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe("getById", () => {
    it("should throw NotFoundError for non-existent availability", async () => {
      await expect(controller.getById("non-existent-id")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getByTourId", () => {
    it("should throw NotFoundError for non-existent tour", async () => {
      await expect(controller.getByTourId("non-existent-tour-id", {})).rejects.toThrow(NotFoundError);
    });
  });
});

