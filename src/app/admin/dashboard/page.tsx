"use client";

import { useDashboardStats } from "@/modules/admin/hooks/useDashboardStats";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { MetricCard } from "@/components/common/MetricCard";
import { ChartCard } from "@/components/common/ChartCard";
import { Card } from "@/components/common/Card/Card";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";

interface RecentOrder {
  code: string;
  customerName: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { stats, isLoading, error } = useDashboardStats();
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await adminApiClient.getOrders({ page: 1, limit: 10 });
        if (response.success && response.data) {
          setRecentOrders(response.data);
        }
      } catch (err) {
        console.error("Error fetching recent orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  // Prepare chart data
  const ordersByStatusData = stats
    ? [
        { name: "Pendientes", value: stats.orders.pending },
        { name: "Pagadas", value: stats.orders.paid },
        { name: "Total", value: stats.orders.total },
      ]
    : [];

  const bookingsByTourData = [
    { name: "Tour 1", value: 45 },
    { name: "Tour 2", value: 32 },
    { name: "Tour 3", value: 28 },
    { name: "Tour 4", value: 15 },
    { name: "Tour 5", value: 10 },
  ];

  const notificationsStatusData = [
    { name: "Enviadas", value: 120 },
    { name: "Pendientes", value: 5 },
    { name: "Error", value: 3 },
  ];

  // Mock revenue over time data (last 7 days)
  const revenueOverTimeData = [
    { name: "Lun", value: 45000 },
    { name: "Mar", value: 52000 },
    { name: "Mié", value: 48000 },
    { name: "Jue", value: 61000 },
    { name: "Vie", value: 55000 },
    { name: "Sáb", value: 67000 },
    { name: "Dom", value: 59000 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error al cargar estadísticas: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Resumen general del sistema</p>
      </div>

      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Total Tours"
          value={`${stats?.tours.active || 0} / ${stats?.tours.total || 0}`}
          icon="map-route"
        />
        <MetricCard
          title="Total Órdenes"
          value={stats?.orders.total || 0}
          icon="credit-card"
        />
        <MetricCard
          title="Órdenes Pendientes"
          value={stats?.orders.pending || 0}
          icon="clock"
        />
        <MetricCard
          title="Reservas Confirmadas"
          value={stats?.bookings.confirmed || 0}
          icon="check"
        />
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(stats?.revenue.total || 0)}
          icon="wallet"
        />
        <MetricCard
          title="Total Reservas"
          value={stats?.bookings.total || 0}
          icon="book-a"
        />
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        <ChartCard
          title="Ingresos (últimos 7 días)"
          type="line"
          data={revenueOverTimeData}
          dataKey="value"
          nameKey="name"
          height={250}
        />
        <ChartCard
          title="Órdenes por Estado"
          type="pie"
          data={ordersByStatusData}
          dataKey="value"
          nameKey="name"
          height={250}
        />
        <ChartCard
          title="Reservas por Tour (Top 5)"
          type="bar"
          data={bookingsByTourData}
          dataKey="value"
          nameKey="name"
          height={250}
        />
        <ChartCard
          title="Estado de Notificaciones"
          type="pie"
          data={notificationsStatusData}
          dataKey="value"
          nameKey="name"
          height={250}
        />
      </div>

      {/* Recent Orders */}
      <div className={styles.recentOrders}>
        <Card title="Órdenes Recientes">
          {ordersLoading ? (
            <p>Cargando órdenes...</p>
          ) : recentOrders.length === 0 ? (
            <p>No hay órdenes recientes</p>
          ) : (
            <div className={styles.ordersList}>
              {recentOrders.map((order) => (
                <div key={order.code} className={styles.orderItem}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderCode}>{order.code}</span>
                    <span className={styles.customerName}>
                      {order.customerName}
                    </span>
                  </div>
                  <div className={styles.orderDetails}>
                    <span className={styles.amount}>
                      {formatCurrency(Number(order.totalAmount))}
                    </span>
                    <span className={styles.status}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

