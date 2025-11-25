/**
 * Endpoint de cron para cancelar órdenes expiradas
 * Protegido por header de autorización o secret de Vercel Cron
 */

import { NextRequest, NextResponse } from "next/server";
import { cancelExpiredOrders } from "@/modules/orders/domain/orderService";

export const dynamic = "force-dynamic";

/**
 * Verifica que la request viene de Vercel Cron o tiene el secret correcto
 */
function isAuthorized(request: NextRequest): boolean {
  // Vercel Cron envía un header Authorization con el secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // También permitir si viene de Vercel Cron (tiene header específico)
  const vercelCron = request.headers.get("x-vercel-cron");
  if (vercelCron === "1") {
    return true;
  }

  // En desarrollo, permitir sin autenticación
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  // Verificar autorización
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const results = await cancelExpiredOrders();

    return NextResponse.json({
      success: true,
      message: `Procesadas ${results.length} órdenes`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error al cancelar órdenes expiradas:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// También permitir POST para compatibilidad con algunos sistemas de cron
export const POST = GET;

