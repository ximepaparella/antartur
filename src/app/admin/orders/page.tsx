"use client";

import { useRouter } from "next/navigation";
import { useDataTable } from "@/modules/admin/hooks/useDataTable";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import type { OrderResponse } from "@/modules/orders/api/dto/ordersDto";
import type { OrderStatus } from "@/components/common/StatusBadge";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { TableColumn } from "@/components/common/Table/Table";
import type { FilterConfig } from "@/components/common/FiltersBar";
import styles from "./page.module.scss";

type Order = OrderResponse;

const columns: TableColumn<Order>[] = [
  {
    key: "code",
    label: "Código",
    render: (value) => <span className={styles.code}>{value}</span>,
  },
  {
    key: "customerName",
    label: "Cliente",
  },
  {
    key: "type",
    label: "Tipo",
    render: (value) => (
      <span className={styles.type}>
        {value === "RESERVATION" ? "Reserva" : "Consulta"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Estado",
    render: (value) => <StatusBadge status={value as OrderStatus} />,
  },
  {
    key: "totalAmount",
    label: "Monto",
    align: "right",
    render: (value, row) => {
      const amount = Number(value);
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: row.currency || "ARS",
      }).format(amount);
    },
  },
  {
    key: "createdAt",
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
];

const filterConfigs: FilterConfig[] = [
  {
    key: "status",
    label: "Estado",
    type: "select",
    options: [
      { value: "", label: "Todos" },
      { value: "PENDING_PAYMENT", label: "Pendiente" },
      { value: "PAID", label: "Pagada" },
      { value: "CANCELLED", label: "Cancelada" },
      { value: "EXPIRED", label: "Expirada" },
      { value: "COMPLETED", label: "Completada" },
    ],
  },
  {
    key: "type",
    label: "Tipo",
    type: "select",
    options: [
      { value: "", label: "Todos" },
      { value: "RESERVATION", label: "Reserva" },
      { value: "ENQUIRY", label: "Consulta" },
    ],
  },
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Código, nombre, email...",
  },
];

export default function AdminOrdersPage() {
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
  } = useDataTable<Order>({
    fetchData: async ({ page, limit, filters }) => {
      const response = await adminApiClient.getOrders({
        page,
        limit,
        status: filters?.status || undefined,
        type: filters?.type || undefined,
      });

      // Simple search filtering (client-side for now)
      let filteredData = response.data || [];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          (order) =>
            order.code.toLowerCase().includes(searchLower) ||
            order.customerName.toLowerCase().includes(searchLower) ||
            order.customerEmail.toLowerCase().includes(searchLower)
        );
      }

      return {
        success: response.success,
        data: filteredData,
        meta: response.meta,
      };
    },
    initialPage: 1,
    initialLimit: 25,
  });

  const handleRowClick = (order: Order) => {
    router.push(`/admin/orders/${order.id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Órdenes</h1>
        <p className={styles.subtitle}>Gestiona todas las órdenes del sistema</p>
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
        emptyMessage="No hay órdenes disponibles"
      />
    </div>
  );
}

