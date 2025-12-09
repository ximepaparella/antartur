"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { Card } from "@/components/common/Card/Card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/common/Button/Button";
import styles from "./page.module.scss";

interface Order {
  id: string;
  code: string;
  type: "RESERVATION" | "ENQUIRY";
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  currency: string;
  totalAmount: number;
  createdAt: string;
  bookings?: any[];
  payments?: any[];
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const response = await adminApiClient.getOrderById(orderId);
        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          setError(response.error || "Failed to fetch order");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Cargando orden...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.error}>
        <p>Error: {error || "Orden no encontrada"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/orders")}>
          Volver a órdenes
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: order.currency || "ARS",
    }).format(amount);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="outline" onClick={() => router.push("/admin/orders")}>
          ← Volver
        </Button>
        <div>
          <h1 className={styles.title}>Orden {order.code}</h1>
          <StatusBadge status={order.status as any} />
        </div>
      </div>

      <div className={styles.content}>
        <Card title="Información de la Orden">
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Código:</span>
              <span className={styles.value}>{order.code}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Tipo:</span>
              <span className={styles.value}>
                {order.type === "RESERVATION" ? "Reserva" : "Consulta"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Estado:</span>
              <StatusBadge status={order.status as any} />
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Cliente:</span>
              <span className={styles.value}>{order.customerName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{order.customerEmail}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Teléfono:</span>
              <span className={styles.value}>{order.customerPhone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Total:</span>
              <span className={styles.value}>{formatCurrency(Number(order.totalAmount))}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Fecha:</span>
              <span className={styles.value}>
                {new Date(order.createdAt).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </Card>

        {order.bookings && order.bookings.length > 0 && (
          <Card title="Reservas">
            <div className={styles.bookingsList}>
              {order.bookings.map((booking: any) => (
                <div key={booking.id} className={styles.bookingItem}>
                  <div>
                    <h4>{booking.tourNameSnapshot || "Tour"}</h4>
                    <p>
                      {new Date(booking.departureDateSnapshot).toLocaleDateString("es-AR")} -{" "}
                      {booking.startTimeSnapshot}
                    </p>
                    <p>
                      {booking.numAdults} adultos, {booking.numChildren} niños
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {order.payments && order.payments.length > 0 && (
          <Card title="Pagos">
            <div className={styles.paymentsList}>
              {order.payments.map((payment: any) => (
                <div key={payment.id} className={styles.paymentItem}>
                  <div>
                    <h4>{payment.provider}</h4>
                    <p>{formatCurrency(Number(payment.amount))}</p>
                    <p>
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString("es-AR")
                        : "Pendiente"}
                    </p>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

