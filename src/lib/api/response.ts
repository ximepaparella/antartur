/**
 * Helpers para respuestas estandarizadas de API
 */

import { NextResponse } from "next/server";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    type: string;
    title: string;
    status: number;
    detail: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

/**
 * Respuesta exitosa simple
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Respuesta exitosa con paginación
 */
export function paginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  status: number = 200
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Respuesta de creación exitosa
 */
export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, 201);
}

/**
 * Respuesta sin contenido
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Calcula metadata de paginación
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Normaliza parámetros de paginación
 */
export function normalizePagination(page?: string | number, limit?: string | number): {
  page: number;
  limit: number;
  skip: number;
} {
  const pageNum = Math.max(1, parseInt(String(page || 1), 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit || 10), 10))); // Max 100 items per page
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
}

