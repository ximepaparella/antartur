"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/modules/admin/hooks/useAdminAuth";
import { AdminLayout } from "@/modules/admin/components/layout/AdminLayout";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevenir múltiples redirecciones
    if (isLoading || hasRedirected.current) return;

    // Permitir acceso a login sin autenticación
    if (pathname === "/admin/login") {
      // Si ya está autenticado, redirigir a dashboard
      if (isAuthenticated) {
        hasRedirected.current = true;
        router.replace("/admin/dashboard");
      }
      return;
    }

    // Proteger todas las demás rutas admin
    if (!isAuthenticated && !isLoading) {
      hasRedirected.current = true;
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Reset redirect flag cuando cambia el pathname
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // No mostrar layout en página de login
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Mostrar layout para usuarios autenticados
  if (!isAuthenticated) {
    return null; // Se redirigirá
  }

  return <AdminLayout>{children}</AdminLayout>;
}

