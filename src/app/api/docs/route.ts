/**
 * API Route: Swagger Documentation
 * GET /api/docs - Swagger UI
 */

import { swaggerSpec } from "@/lib/api/swagger";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(swaggerSpec);
}

