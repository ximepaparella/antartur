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

  /**
   * Obtiene el tipo de cambio entre dos monedas
   * Busca el rate más reciente válido para la fecha especificada
   */
  async getExchangeRate(input: GetExchangeRateInput): Promise<number | null> {
    const { baseCurrency, quoteCurrency, date = new Date() } = input;

    // Si las monedas son iguales, retornar 1
    if (baseCurrency === quoteCurrency) {
      return 1;
    }

    // Buscar rate directo
    const directRate = await prisma.currencyRate.findFirst({
      where: {
        baseCurrency,
        quoteCurrency,
        validFrom: { lte: date },
        OR: [
          { validTo: null },
          { validTo: { gte: date } },
        ],
      },
      orderBy: {
        validFrom: "desc",
      },
    });

    if (directRate) {
      return Number(directRate.rate);
    }

    // Buscar rate inverso y calcular
    const inverseRate = await prisma.currencyRate.findFirst({
      where: {
        baseCurrency: quoteCurrency,
        quoteCurrency: baseCurrency,
        validFrom: { lte: date },
        OR: [
          { validTo: null },
          { validTo: { gte: date } },
        ],
      },
      orderBy: {
        validFrom: "desc",
      },
    });

    if (inverseRate) {
      return 1 / Number(inverseRate.rate);
    }

    return null;
  }
}

