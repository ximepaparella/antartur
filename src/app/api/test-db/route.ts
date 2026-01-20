/**
 * Endpoint de prueba para verificar el schema de base de datos
 * Lista todas las tablas, conteos y verifica relaciones
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Verificar conexión básica
    await prisma.$connect();

    // Verificar tablas directamente con SQL raw
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    // Obtener conteos usando SQL raw para evitar problemas con Prisma Client
    const counts: Record<string, number> = {};

    for (const table of tables) {
      try {
        const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
          `SELECT COUNT(*)::bigint as count FROM "${table.tablename}"`,
        );
        counts[table.tablename] = Number(result[0]?.count || 0);
      } catch (error) {
        counts[table.tablename] = -1;
      }
    }

    // Intentar obtener datos de Currency usando SQL raw
    let currencies: unknown[] = [];
    try {
      currencies = await prisma.$queryRaw<Array<unknown>>`
        SELECT * FROM "Currency" LIMIT 5
      `;
    } catch (e) {
      console.error("Error fetching currencies:", e);
    }

    // Verificar índices (query simplificada)
    let indexes: Array<{ tablename: string; indexname: string }> = [];
    try {
      indexes = await prisma.$queryRaw<
        Array<{ tablename: string; indexname: string }>
      >`
        SELECT
          tablename,
          indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename IN (
            'Currency', 'CurrencyRate', 'Tour', 'TourImage', 'TourDeparture',
            'Order', 'Booking', 'Passenger', 'Payment', 'Notification', 'User'
          )
        ORDER BY tablename, indexname
      `;
    } catch (e) {
      console.error("Error fetching indexes:", e);
    }

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
      tables: tables.map((t) => t.tablename),
      counts,
      sampleData: {
        currencies: currencies.map((c) => ({
          code: c.code,
          name: c.name,
          symbol: c.symbol,
          isDefault: c.isDefault,
        })),
      },
      indexes: indexes.reduce(
        (acc, row) => {
          if (!acc[row.tablename]) {
            acc[row.tablename] = [];
          }
          acc[row.tablename].push(row.indexname);
          return acc;
        },
        {} as Record<string, string[]>,
      ),
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        error:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
  // Note: No $disconnect() call - Prisma Client uses connection pooling
  // and manages connections automatically via singleton pattern
}
