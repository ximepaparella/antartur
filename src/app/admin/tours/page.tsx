"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDataTable } from "@/modules/admin/hooks/useDataTable";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/common/Button/Button";
import { Trash2 } from "lucide-react";
import type { TableColumn } from "@/components/common/Table/Table";
import type { FilterConfig } from "@/components/common/FiltersBar";
import styles from "./page.module.scss";

interface Tour {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  slug: string;
}

const getColumns = (onDelete: (tourId: string, tourName: string) => void, deletingId: string | null): TableColumn<Tour>[] => [
  {
    key: "name",
    label: "Nombre",
  },
  {
    key: "category",
    label: "Categoría",
    render: (value) => (
      <span className={styles.category}>{value}</span>
    ),
  },
  {
    key: "isActive",
    label: "Estado",
    render: (value) => (
      <StatusBadge
        status={value ? ("ACTIVE" as any) : ("INACTIVE" as any)}
      />
    ),
  },
  {
    key: "slug",
    label: "Slug",
    render: (value) => <span className={styles.slug}>{value}</span>,
  },
  {
    key: "actions",
    label: "Acciones",
    align: "right",
    render: (_, row) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Button
          variant="danger"
          size="small"
          onClick={() => onDelete(row.id, row.name)}
          disabled={deletingId === row.id}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    ),
  },
];

const filterConfigs: FilterConfig[] = [
  {
    key: "category",
    label: "Categoría",
    type: "select",
    options: [
      { value: "", label: "Todas" },
      { value: "summer", label: "Verano" },
      { value: "winter", label: "Invierno" },
    ],
  },
  {
    key: "isActive",
    label: "Estado",
    type: "select",
    options: [
      { value: "", label: "Todos" },
      { value: "true", label: "Activo" },
      { value: "false", label: "Inactivo" },
    ],
  },
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Nombre del tour...",
  },
];

export default function AdminToursPage() {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTours = useCallback(async ({ page, limit, filters }: {
    page: number;
    limit: number;
    filters?: Record<string, string>;
  }) => {
    const response = await adminApiClient.getTours({
      page,
      limit,
      category: filters?.category || undefined,
      isActive:
        filters?.isActive !== undefined
          ? filters.isActive === "true"
          : undefined,
    });

    // Simple search filtering
    let filteredData = response.data || [];
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter((tour) =>
        tour.name.toLowerCase().includes(searchLower)
      );
    }

    return {
      ...response,
      data: filteredData,
    };
  }, []);

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
  } = useDataTable<Tour>({
    fetchData: fetchTours,
    initialPage: 1,
    initialLimit: 25,
  });

  const handleRowClick = (tour: Tour) => {
    router.push(`/admin/tours/${tour.id}`);
  };

  const handleDelete = useCallback(async (tourId: string, tourName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el tour "${tourName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeletingId(tourId);
      const response = await adminApiClient.deleteTour(tourId);
      if (response.success) {
        // Recargar la tabla
        refetch();
      } else {
        alert(`Error al eliminar: ${response.error || "Error desconocido"}`);
      }
    } catch (err) {
      alert(`Error al eliminar: ${err instanceof Error ? err.message : "Error desconocido"}`);
    } finally {
      setDeletingId(null);
    }
  }, [refetch]);

  const columns = getColumns(handleDelete, deletingId);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tours</h1>
          <p className={styles.subtitle}>Gestiona todos los tours del sistema</p>
        </div>
        <Button variant="primary" onClick={() => router.push("/admin/tours/new")}>
          Nuevo Tour
        </Button>
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
        emptyMessage="No hay tours disponibles"
      />
    </div>
  );
}

