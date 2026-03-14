import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";

const DB_CHECK_TIMEOUT_MS = 1000;

async function checkDatabase() {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB health check timeout")), DB_CHECK_TIMEOUT_MS)
      ),
    ]);

    return { ok: true as const };
  } catch (error) {
    logger.error("Health check: database unavailable", error);
    return { ok: false as const, error: "database unavailable" };
  }
}

export async function GET() {
  const startedAt = Date.now();

  const db = await checkDatabase();
  const durationMs = Date.now() - startedAt;

  const healthy = db.ok;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds:
        typeof process.uptime === "function" ? Math.round(process.uptime()) : undefined,
      env: process.env.NODE_ENV,
      db: {
        status: db.ok ? "ok" : "error",
        ...(db.ok ? {} : { error: db.error }),
        responseTimeMs: durationMs,
      },
    },
    { status: healthy ? 200 : 503 }
  );
}

