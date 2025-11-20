/**
 * Repositorio para acceso a datos de Currency usando Prisma
 */

import { prisma } from "@/lib/db";
import type { Currency } from "@prisma/client";

export class CurrencyRepository {
  async findAll(): Promise<Currency[]> {
    return prisma.currency.findMany({
      orderBy: {
        isDefault: "desc",
      },
    });
  }

  async findByCode(code: string): Promise<Currency | null> {
    return prisma.currency.findUnique({
      where: { code },
    });
  }

  async findDefault(): Promise<Currency | null> {
    return prisma.currency.findFirst({
      where: { isDefault: true },
    });
  }

}

