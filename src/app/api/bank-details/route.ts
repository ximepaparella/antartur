/**
 * Endpoint para obtener datos bancarios para transferencias
 * Estos datos son públicos y se muestran en la página de transferencia
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const bankData = {
    accountName: process.env.BANK_ACCOUNT_NAME || "Gustavo Adolfo Francisco Giro",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "6893238937",
    bank: process.env.BANK_NAME || "HSBC",
    cuit: process.env.BANK_CUIT || "20-20453913-9",
    cbu: process.env.BANK_CBU || "1500689100068932389378",
    alias: process.env.BANK_ALIAS || "Antartur",
  };

  return NextResponse.json(bankData);
}

