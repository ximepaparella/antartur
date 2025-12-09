"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminBookingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a órdenes (que ahora incluye toda la información de reservas)
    router.replace("/admin/orders");
  }, [router]);

  return null;
}
