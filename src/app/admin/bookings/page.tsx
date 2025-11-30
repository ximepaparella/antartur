"use client";

import { useRouter } from "next/navigation";
import { useDataTable } from "@/modules/admin/hooks/useDataTable";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { DataTable } from "@/modules/admin/components/DataTable/DataTable";
import { StatusBadge } from "@/modules/admin/components/StatusBadge/StatusBadge";
import type { TableColumn } from "@/components/common/Table/Table";
import type { FilterConfig } from "@/modules/admin/components/FiltersBar/FiltersBar";
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
  order?: {
    code: string;
  };
}

const columns: TableColumn<Booking>[] = [
  {
    key: "tourNameSnapshot",
    label: "Tour",
  },
  {
    key: "departureDateSnapshot",
    label: "Fecha",
    render: (value) => {
      const date = new Date(value);
      return date.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    key: "startTimeSnapshot",
    label: "Hora",
  },
  {
    key: "numAdults",
    label: "Pasajeros",
    render: (value, row) => (
      <span>
        {row.numAdults} adultos, {row.numChildren} niños
      </span>
    ),
  },
  {
    key: "status",
    label: "Estado",
    render: (value) => <StatusBadge status={value as any} />,
  },
  {
    key: "orderId",
    label: "Orden",
    render: (value, row) => (
      <span className={styles.orderCode}>
        {row.order?.code || value.substring(0, 8)}
      </span>
    ),
  },
];

const filterConfigs: FilterConfig[] = [
  {
    key: "status",
    label: "Estado",
    type: "select",
    options: [
      { value: "", label: "Todos" },
      { value: "HELD", label: "Reservada" },
      { value: "CONFIRMED", label: "Confirmada" },
      { value: "CANCELLED", label: "Cancelada" },
    ],
  },
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Tour, orden...",
  },
];

export default function AdminBookingsPage() {
  const router = useRouter();

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
  } = useDataTable<Booking>({
    fetchData: async ({ page, limit, filters }) => {
      const response = await adminApiClient.getBookings({
        page,
        limit,
        status: filters?.status || undefined,
        orderId: filters?.orderId || undefined,
      });

      // Simple search filtering
      let filteredData = response.data || [];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          (booking) =>
            booking.tourNameSnapshot.toLowerCase().includes(searchLower) ||
            booking.order?.code?.toLowerCase().includes(searchLower)
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

  const handleRowClick = (booking: Booking) => {
    router.push(`/admin/bookings/${booking.id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reservas</h1>
        <p className={styles.subtitle}>Gestiona todas las reservas del sistema</p>
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
        emptyMessage="No hay reservas disponibles"
      />
    </div>
  );
}

