/**
 * Tests para endpoints de Orders
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { OrdersController } from "@/modules/orders/api/controllers/ordersController";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";

describe("OrdersController", () => {
  let controller: OrdersController;

  beforeEach(() => {
    controller = new OrdersController();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe("getById", () => {
    it("should throw NotFoundError for non-existent order", async () => {
      await expect(controller.getById("non-existent-id")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getByCode", () => {
    it("should throw NotFoundError for non-existent code", async () => {
      await expect(controller.getByCode("ANT-2024-9999")).rejects.toThrow(NotFoundError);
    });
  });

  describe("create", () => {
    it("should throw ValidationError when passengers count doesn't match", async () => {
      const orderData = {
        tourId: "test-tour-id",
        departureId: "test-departure-id",
        numAdults: 2,
        numChildren: 1,
        currency: "ARS",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "+5491112345678",
        passengers: [
          {
            type: "ADULT",
            firstName: "John",
            lastName: "Doe",
          },
        ],
      };

      await expect(controller.create(orderData)).rejects.toThrow(ValidationError);
    });
  });
});

