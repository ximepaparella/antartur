"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/modules/admin/hooks/useAdminAuth";
import { AdminLayout } from "@/modules/admin/components/AdminLayout/AdminLayout";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Allow access to login page without authentication
      if (pathname === "/admin/login") {
        // If already authenticated, redirect to dashboard
        if (isAuthenticated) {
          router.push("/admin/dashboard");
        }
        return;
      }

      // Protect all other admin routes
      if (!isAuthenticated) {
        router.push("/admin/login");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show layout for authenticated users
  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <AdminLayout>{children}</AdminLayout>;
}

