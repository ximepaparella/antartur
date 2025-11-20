/**
 * Repositorio para acceso a datos de Currency usando Prisma
 */

import type { GetExchangeRateInput } from "../domain/types";
import { prisma } from "@/lib/db";

export class CurrencyRepository {
  async findAll() {
    return prisma.currency.findMany({
      orderBy: {
        isDefault: "desc",
      },
    });
  }

  async findByCode(code: string) {
    return prisma.currency.findUnique({
      where: { code },
    });
  }

  async findDefault() {
    return prisma.currency.findFirst({
      where: { isDefault: true },
    });
  }

}

