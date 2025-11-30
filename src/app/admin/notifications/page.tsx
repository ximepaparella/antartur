"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDataTable } from "@/modules/admin/hooks/useDataTable";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { DataTable } from "@/modules/admin/components/DataTable/DataTable";
import { StatusBadge } from "@/modules/admin/components/StatusBadge/StatusBadge";
import { MetricCard } from "@/modules/admin/components/MetricCard/MetricCard";
import type { TableColumn } from "@/components/common/Table/Table";
import type { FilterConfig } from "@/modules/admin/components/FiltersBar/FiltersBar";
import styles from "./page.module.scss";

interface Notification {
  id: string;
  type: "EMAIL" | "WHATSAPP";
  recipient: string;
  templateKey: string;
  status: string;
  sentAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
}

const columns: TableColumn<Notification>[] = [
  {
    key: "type",
    label: "Tipo",
    render: (value) => (
      <span className={styles.type}>
        {value === "EMAIL" ? "Email" : "WhatsApp"}
      </span>
    ),
  },
  {
    key: "recipient",
    label: "Destinatario",
  },
  {
    key: "templateKey",
    label: "Plantilla",
    render: (value) => (
      <span className={styles.template}>{value.replace(/-/g, " ")}</span>
    ),
  },
  {
    key: "status",
    label: "Estado",
    render: (value) => <StatusBadge status={value as any} />,
  },
  {
    key: "sentAt",
    label: "Enviado",
    render: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      return date.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    key: "retryCount",
    label: "Reintentos",
    align: "center",
  },
];

const filterConfigs: FilterConfig[] = [
  {
    key: "type",
    label: "Tipo",
    type: "select",
    options: [
      { value: "", label: "Todos" },
      { value: "EMAIL", label: "Email" },
      { value: "WHATSAPP", label: "WhatsApp" },
    ],
  },
  {
    key: "status",
    label: "Estado",
    type: "select",
    options: [
      { value: "", label: "Todos" },
      { value: "PENDING", label: "Pendiente" },
      { value: "SENT", label: "Enviada" },
      { value: "ERROR", label: "Error" },
    ],
  },
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Destinatario, plantilla...",
  },
];

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    error: 0,
  });

  const {
    data,
    isLoading,
    error,
    page,
    limit,
    filters,
    meta,
    handlePageChange,
    handleLimitChange,
    handleFilterChange,
    clearFilters,
    refetch,
  } = useDataTable<Notification>({
    fetchData: async ({ page, limit, filters }) => {
      const response = await adminApiClient.getNotifications({
        page,
        limit,
        type: filters?.type || undefined,
        status: filters?.status || undefined,
      });

      // Calculate stats
      if (response.data) {
        const total = response.data.length;
        const sent = response.data.filter((n) => n.status === "SENT").length;
        const pending = response.data.filter((n) => n.status === "PENDING").length;
        const error = response.data.filter((n) => n.status === "ERROR").length;
        setStats({ total, sent, pending, error });
      }

      // Simple search filtering
      let filteredData = response.data || [];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          (notification) =>
            notification.recipient.toLowerCase().includes(searchLower) ||
            notification.templateKey.toLowerCase().includes(searchLower)
        );
      }

      return {
        ...response,
        data: filteredData,
      };
    },
    initialPage: 1,
    initialLimit: 25,
  });

  const handleRowClick = (notification: Notification) => {
    router.push(`/admin/notifications/${notification.id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notificaciones</h1>
        <p className={styles.subtitle}>Gestiona todas las notificaciones del sistema</p>
      </div>

      <div className={styles.statsGrid}>
        <MetricCard title="Total" value={stats.total} icon="email" />
        <MetricCard title="Enviadas" value={stats.sent} icon="check" />
        <MetricCard title="Pendientes" value={stats.pending} icon="clock" />
        <MetricCard title="Con Error" value={stats.error} icon="alert-circle" />
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={meta?.totalPages || 1}
        onPageChange={handlePageChange}
        pageSize={limit}
        onPageSizeChange={handleLimitChange}
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onRowClick={handleRowClick}
        emptyMessage="No hay notificaciones disponibles"
      />
    </div>
  );
}

