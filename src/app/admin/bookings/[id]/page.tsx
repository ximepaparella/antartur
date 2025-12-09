"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  useEffect(() => {
    // Obtener la orden asociada a esta reserva y redirigir
    const fetchAndRedirect = async () => {
      try {
        const response = await adminApiClient.getBookingById(bookingId);
        if (response.success && response.data && response.data.orderId) {
          router.replace(`/admin/orders/${response.data.orderId}`);
        } else {
          router.replace("/admin/orders");
        }
      } catch (err) {
        router.replace("/admin/orders");
      }
    };

    if (bookingId) {
      fetchAndRedirect();
    }
  }, [bookingId, router]);

  return null;
}
