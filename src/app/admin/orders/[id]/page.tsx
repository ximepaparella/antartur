"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { Card } from "@/components/common/Card/Card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/common/Button/Button";
import styles from "./page.module.scss";

interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
  birthDate?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  nationality?: string | null;
  email?: string | null;
  phone?: string | null;
  restrictions?: Record<string, any> | null;
}

interface Booking {
  id: string;
  tourNameSnapshot: string;
  departureDateSnapshot: string;
  startTimeSnapshot: string;
  meetingPointSnapshot?: string | null;
  numAdults: number;
  numChildren: number;
  status: string;
  passengers?: Passenger[];
}

interface Payment {
  id: string;
  provider: string;
  amount: number;
  status: string;
  paidAt?: string | null;
  providerPaymentId?: string | null;
  transactionId?: string | null;
}

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
  notes?: string | null;
  createdAt: string;
  bookings?: Booking[];
  payments?: Payment[];
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

  const calculateAge = (birthDate: string | null | undefined): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatRestrictions = (restrictions: Record<string, any> | null | undefined): string => {
    if (!restrictions) return "Ninguna";
    const parts: string[] = [];
    
    // Restricciones alimentarias (foodRestrictions)
    if (restrictions.foodRestrictions) {
      const foodRestrictions = restrictions.foodRestrictions;
      const foodParts: string[] = [];
      if (foodRestrictions.vegetariano) foodParts.push("Vegetariano");
      if (foodRestrictions.vegano) foodParts.push("Vegano");
      if (foodRestrictions.celiaco) foodParts.push("Celiaco");
      if (foodRestrictions.alergias) {
        foodParts.push(`Alergias${foodRestrictions.alergiasDetalle ? `: ${foodRestrictions.alergiasDetalle}` : ""}`);
      }
      if (foodParts.length > 0) {
        parts.push(`Restricciones alimentarias: ${foodParts.join(", ")}`);
      }
    }
    
    // Embarazo
    if (restrictions.pregnant) {
      parts.push("Embarazada");
    }
    
    // Problemas de salud/columna
    if (restrictions.healthIssues) {
      parts.push("Problemas de columna/salud");
    }
    
    // Compatibilidad con formato antiguo (por si acaso)
    if (restrictions.dietary) parts.push(`Dietarias: ${restrictions.dietary}`);
    if (restrictions.medical) parts.push(`Médicas: ${restrictions.medical}`);
    if (restrictions.mobility) parts.push(`Movilidad: ${restrictions.mobility}`);
    if (restrictions.other) parts.push(`Otras: ${restrictions.other}`);
    
    return parts.length > 0 ? parts.join("; ") : "Ninguna";
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
            {order.bookings.map((booking: Booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <h3>{booking.tourNameSnapshot || "Tour"}</h3>
                  <StatusBadge status={booking.status as any} />
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
                        const age = calculateAge(passenger.birthDate);
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
                                  {formatRestrictions(passenger.restrictions)}
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
              {order.payments.map((payment: Payment) => (
                <div key={payment.id} className={styles.paymentCard}>
                  <div className={styles.paymentHeader}>
                    <h4>{payment.provider === "PAYPAL" ? "PayPal" : 
                          payment.provider === "PAYWAY" ? "Payway" : 
                          payment.provider === "TRANSFER" ? "Transferencia Bancaria" : 
                          payment.provider}</h4>
                    <StatusBadge status={payment.status as any} />
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
                    {payment.transactionId && (
                      <div className={styles.paymentDetail}>
                        <span className={styles.paymentLabel}>ID de Transacción:</span>
                        <span className={styles.paymentValue}>{payment.transactionId}</span>
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
