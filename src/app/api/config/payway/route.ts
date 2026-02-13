/**
 * Configuración pública de Payway para el cliente (SDK).
 * Solo expone publicKey y environment; no incluye claves privadas.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  // Servidor: usar PAYWAY_PUBLIC_KEY o NEXT_PUBLIC_* (el cliente obtiene la key vía esta API en runtime)
  const publicKey = process.env.PAYWAY_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_PAYWAY_PUBLIC_KEY;
  const environment = process.env.PAYWAY_ENVIRONMENT ?? process.env.NEXT_PUBLIC_PAYWAY_ENVIRONMENT ?? "sandbox";

  if (!publicKey || publicKey.trim() === "") {
    return NextResponse.json(
      { error: "Payway no configurado", publicKey: null, environment: "sandbox" },
      { status: 503 }
    );
  }

  return NextResponse.json({
    publicKey: publicKey.trim(),
    environment: environment === "production" ? "production" : "sandbox",
  });
}
