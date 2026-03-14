"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { getAllowedOrderStatusTransitions, ORDER_STATUS_LABELS } from "@/modules/orders/lib/orderStatusTransitions";
import type { OrderFullResponse, BookingResponse, PassengerResponse, PaymentResponse } from "@/modules/orders/api/dto/ordersDto";
import { calculateAge } from "@/lib/utils/pricing";
import { formatRestrictions } from "@/modules/notifications/utils/formatRestrictions";
import { Card } from "@/components/common/Card/Card";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { OrderStatus, BookingStatus, PaymentStatus } from "@/components/common/StatusBadge";
import { Button } from "@/components/common/Button/Button";
import { Select } from "@/components/common/Select/Select";
import styles from "./page.module.scss";

// Use DTO types directly
type Passenger = PassengerResponse;
type Booking = BookingResponse & {
  passengers?: Passenger[];
};
type Payment = PaymentResponse;
type Order = OrderFullResponse;

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const response = await adminApiClient.getOrderById(orderId);
        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          setError("Failed to fetch order");
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

  const handleStatusChange = async (value: string) => {
    if (!order) return;
    const nextStatus = value as OrderStatus;
    const prevStatus = order.status as OrderStatus;
    if (nextStatus === prevStatus) {
      setNewStatus(nextStatus);
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setError(null);
      setNewStatus(nextStatus);
      const response = await adminApiClient.updateOrderStatus(order.id, nextStatus);
      if (response.success && response.data) {
        setOrder((prev) => (prev ? { ...prev, status: response.data.status } : prev));
      } else {
        setNewStatus(prevStatus);
        setError("No se pudo actualizar el estado de la orden");
      }
    } catch (err) {
      setNewStatus(prevStatus);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al actualizar el estado de la orden"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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
        <div className={styles.statusRow}>
          <h1 className={styles.title}>Orden {order.code}</h1>
        </div>
      </div>

      <div className={styles.statusBox}>
            <span className={styles.statusBoxLabel}>Estado</span>
            <StatusBadge status={order.status as OrderStatus} />
            <div className={styles.statusControls}>
              <Select
                name="orderStatus"
                value={newStatus ?? (order.status as OrderStatus)}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                options={(() => {
                  const current = order.status as OrderStatus;
                  const allowed = getAllowedOrderStatusTransitions(current);
                  const statuses = allowed.length > 0 ? allowed : [current];
                  return statuses.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] ?? s }));
                })()}
              />
            </div>
          </div>

      <div className={styles.content}>
        {/* Información de la Orden */}
        <Card title="Información de la Orden">
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Código:</span>
              <span className={styles.value}>{order.code}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Tipo:</span>
              <span className={styles.value}>
                {order.type === "RESERVATION" ? "Reserva" : order.type === "ENQUIRY" ? "Consulta" : order.type}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Estado:</span>
              <StatusBadge status={order.status as OrderStatus} />
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
            {order.notes && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Notas:</span>
                <span className={styles.value}>{order.notes}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Reservas con información completa */}
        {order.bookings && order.bookings.length > 0 && (
          <Card title="Reservas">
            {order.bookings?.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <h3>{booking.tourNameSnapshot || "Tour"}</h3>
                  <StatusBadge status={booking.status as BookingStatus} />
                </div>
                
                <div className={styles.bookingDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Fecha:</span>
                    <span className={styles.detailValue}>
                      {new Date(booking.departureDateSnapshot).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Hora de inicio:</span>
                    <span className={styles.detailValue}>{booking.startTimeSnapshot}</span>
                  </div>
                  {booking.meetingPointSnapshot && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Punto de encuentro:</span>
                      <span className={styles.detailValue}>{booking.meetingPointSnapshot}</span>
                    </div>
                  )}
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Pasajeros:</span>
                    <span className={styles.detailValue}>
                      {booking.numAdults} adultos, {booking.numChildren} niños
                    </span>
                  </div>
                </div>

                {/* Información completa de pasajeros */}
                {booking.passengers && booking.passengers.length > 0 && (
                  <div className={styles.passengersSection}>
                    <h4 className={styles.passengersTitle}>Pasajeros</h4>
                    <div className={styles.passengersList}>
                      {booking.passengers.map((passenger: Passenger) => {
                        const age = passenger.birthDate ? calculateAge(passenger.birthDate) : null;
                        return (
                          <div key={passenger.id} className={styles.passengerCard}>
                            <div className={styles.passengerHeader}>
                              <h5>
                                {passenger.firstName} {passenger.lastName}
                              </h5>
                              <span className={styles.passengerType}>
                                {passenger.type === "ADULT" ? "Adulto" : 
                                 passenger.type === "CHILD" ? "Niño" : "Infante"}
                              </span>
                            </div>
                            <div className={styles.passengerDetails}>
                              {age !== null && (
                                <div className={styles.passengerDetail}>
                                  <span className={styles.passengerLabel}>Edad:</span>
                                  <span className={styles.passengerValue}>{age} años</span>
                                </div>
                              )}
                              {passenger.birthDate && (
                                <div className={styles.passengerDetail}>
                                  <span className={styles.passengerLabel}>Fecha de nacimiento:</span>
                                  <span className={styles.passengerValue}>
                                    {new Date(passenger.birthDate).toLocaleDateString("es-AR")}
                                  </span>
                                </div>
                              )}
                              {passenger.documentType && passenger.documentNumber && (
                                <div className={styles.passengerDetail}>
                                  <span className={styles.passengerLabel}>Documento:</span>
                                  <span className={styles.passengerValue}>
                                    {passenger.documentType} {passenger.documentNumber}
                                  </span>
                                </div>
                              )}
                              {passenger.nationality && (
                                <div className={styles.passengerDetail}>
                                  <span className={styles.passengerLabel}>Nacionalidad:</span>
                                  <span className={styles.passengerValue}>{passenger.nationality}</span>
                                </div>
                              )}
                              {passenger.email && (
                                <div className={styles.passengerDetail}>
                                  <span className={styles.passengerLabel}>Email:</span>
                                  <span className={styles.passengerValue}>{passenger.email}</span>
                                </div>
                              )}
                              {passenger.phone && (
                                <div className={styles.passengerDetail}>
                                  <span className={styles.passengerLabel}>Teléfono:</span>
                                  <span className={styles.passengerValue}>{passenger.phone}</span>
                                </div>
                              )}
                              <div className={styles.passengerDetail}>
                                <span className={styles.passengerLabel}>Restricciones:</span>
                                <span className={styles.passengerValue}>
                                  {formatRestrictions(passenger.restrictions) || "Ninguna"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}

        {/* Pagos */}
        {order.payments && order.payments.length > 0 && (
          <Card title="Pagos">
            <div className={styles.paymentsList}>
              {order.payments?.map((payment) => (
                <div key={payment.id} className={styles.paymentCard}>
                  <div className={styles.paymentHeader}>
                    <h4>{payment.provider === "PAYPAL" ? "PayPal" : 
                          payment.provider === "PAYWAY" ? "Payway" : 
                          payment.provider === "TRANSFER" ? "Transferencia Bancaria" : 
                          payment.provider}</h4>
                    <StatusBadge status={payment.status as PaymentStatus} />
                  </div>
                  <div className={styles.paymentDetails}>
                    <div className={styles.paymentDetail}>
                      <span className={styles.paymentLabel}>Monto:</span>
                      <span className={styles.paymentValue}>{formatCurrency(Number(payment.amount))}</span>
                    </div>
                    {payment.paidAt && (
                      <div className={styles.paymentDetail}>
                        <span className={styles.paymentLabel}>Fecha de pago:</span>
                        <span className={styles.paymentValue}>
                          {new Date(payment.paidAt).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                    {payment.providerPaymentId && (
                      <div className={styles.paymentDetail}>
                        <span className={styles.paymentLabel}>ID de Proveedor:</span>
                        <span className={styles.paymentValue}>{payment.providerPaymentId}</span>
                      </div>
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
