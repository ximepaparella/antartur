"use client";

import { Table, TableColumn } from "@/components/common/Table/Table";
import { Pagination } from "@/components/common/Pagination/Pagination";
import { FiltersBar, FilterConfig } from "../FiltersBar/FiltersBar";
import { Card } from "@/components/common/Card/Card";
import styles from "./DataTable.module.scss";

interface DataTableProps<T = any> {
  title?: string;
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T = any>({
  title,
  columns,
  data,
  isLoading = false,
  error,
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  filters,
  filterValues = {},
  onFilterChange,
  onClearFilters,
  onRowClick,
  emptyMessage = "No hay datos disponibles",
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`${styles.dataTable} ${className}`.trim()}>
      {title && <h2 className={styles.title}>{title}</h2>}

      {filters && onFilterChange && (
        <FiltersBar
          filters={filters}
          values={filterValues}
          onFilterChange={onFilterChange}
          onClear={onClearFilters}
        />
      )}

      <Card>
        {isLoading ? (
          <div className={styles.loading}>
            <p>Cargando datos...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>Error: {error}</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              onRowClick={onRowClick}
              emptyMessage={emptyMessage}
            />
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
                pageSize={pageSize}
                onPageSizeChange={onPageSizeChange}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}

