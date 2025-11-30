"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { Card } from "@/components/common/Card/Card";
import { StatusBadge } from "@/modules/admin/components/StatusBadge/StatusBadge";
import { Button } from "@/components/common/Button/Button";
import styles from "./page.module.scss";

interface Booking {
  id: string;
  tourNameSnapshot: string;
  departureDateSnapshot: string;
  startTimeSnapshot: string;
  numAdults: number;
  numChildren: number;
  status: string;
  orderId: string;
  passengers?: any[];
  order?: {
    code: string;
    customerName: string;
  };
}

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const response = await adminApiClient.getBookingById(bookingId);
        if (response.success && response.data) {
          setBooking(response.data);
        } else {
          setError(response.error || "Failed to fetch booking");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Cargando reserva...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.error}>
        <p>Error: {error || "Reserva no encontrada"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/bookings")}>
          Volver a reservas
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="outline" onClick={() => router.push("/admin/bookings")}>
          ← Volver
        </Button>
        <div>
          <h1 className={styles.title}>Reserva #{booking.id.substring(0, 8)}</h1>
          <StatusBadge status={booking.status as any} />
        </div>
      </div>

      <div className={styles.content}>
        <Card title="Información de la Reserva">
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Tour:</span>
              <span className={styles.value}>{booking.tourNameSnapshot}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Fecha:</span>
              <span className={styles.value}>
                {new Date(booking.departureDateSnapshot).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Hora:</span>
              <span className={styles.value}>{booking.startTimeSnapshot}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Pasajeros:</span>
              <span className={styles.value}>
                {booking.numAdults} adultos, {booking.numChildren} niños
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Estado:</span>
              <StatusBadge status={booking.status as any} />
            </div>
            {booking.order && (
              <>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Orden:</span>
                  <span className={styles.value}>{booking.order.code}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Cliente:</span>
                  <span className={styles.value}>{booking.order.customerName}</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {booking.passengers && booking.passengers.length > 0 && (
          <Card title="Pasajeros">
            <div className={styles.passengersList}>
              {booking.passengers.map((passenger: any) => (
                <div key={passenger.id} className={styles.passengerItem}>
                  <div>
                    <h4>
                      {passenger.firstName} {passenger.lastName}
                    </h4>
                    <p>Tipo: {passenger.type}</p>
                    {passenger.birthDate && (
                      <p>
                        Fecha de nacimiento:{" "}
                        {new Date(passenger.birthDate).toLocaleDateString("es-AR")}
                      </p>
                    )}
                    {passenger.documentNumber && (
                      <p>Documento: {passenger.documentNumber}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

