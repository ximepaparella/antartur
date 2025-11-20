/**
 * Helpers para hacer requests en tests
 */

import { NextRequest } from "next/server";

/**
 * Crea un NextRequest mock para testing
 */
export function createMockRequest(
  method: string = "GET",
  url: string = "http://localhost:3000",
  body?: unknown,
  headers?: Record<string, string>
): NextRequest {
  const requestHeaders = new Headers(headers || {});

  const init: { method: string; headers: Headers; body?: string } = {
    method,
    headers: requestHeaders,
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    requestHeaders.set("Content-Type", "application/json");
    init.body = JSON.stringify(body);
  }

  return new NextRequest(url, init);
}

/**
 * Crea un NextRequest con query parameters
 */
export function createMockRequestWithQuery(
  method: string = "GET",
  baseUrl: string = "http://localhost:3000",
  queryParams?: Record<string, string | number | boolean>
): NextRequest {
  const url = new URL(baseUrl);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  return new NextRequest(url.toString(), { method });
}

