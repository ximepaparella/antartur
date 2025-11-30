"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/modules/layout/components/Header/Header";
import { Footer } from "@/modules/layout/components/Footer/Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

/**
 * ConditionalLayout - Renderiza Header/Footer solo en rutas públicas
 * 
 * En Next.js 15, la mejor práctica sería usar Route Groups:
 * - app/(site)/layout.tsx con Header/Footer para rutas públicas
 * - app/admin/layout.tsx sin Header/Footer (ya implementado)
 * 
 * Esta solución es pragmática y funciona bien, pero requiere
 * verificación client-side con usePathname().
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Rutas que NO deben mostrar Header/Footer
  const excludedRoutes = ["/admin", "/api"];
  const shouldShowLayout = !excludedRoutes.some((route) => pathname?.startsWith(route));

  return (
    <>
      {shouldShowLayout && <Header />}
      {children}
      {shouldShowLayout && <Footer />}
    </>
  );
}

