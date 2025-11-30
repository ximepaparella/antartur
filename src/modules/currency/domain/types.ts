/**
 * Tipos de dominio para Currency
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyRate {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source?: string | null;
  validFrom: Date;
  validTo?: Date | null;
  createdAt: Date;
}

export interface GetExchangeRateInput {
  baseCurrency: string;
  quoteCurrency: string;
  date?: Date;
}

