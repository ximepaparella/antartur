import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HERO_PRELOAD: Record<string, string> = {
  "/": "/images/banners/hero-home.jpg",
  "/invierno": "/images/banners/hero-invierno.jpg",
  "/verano": "/images/banners/hero-verano.jpg",
  "/antartida": "/images/banners/hero-antartida.jpg",
  "/turismo-corporativo": "/images/banners/hero-corporativo.jpg",
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;
  const relative = HERO_PRELOAD[path];
  if (relative) {
    response.headers.append("Link", `<${relative}>; rel=preload; as=image`);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
