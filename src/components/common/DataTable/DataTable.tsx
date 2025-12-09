"use client";

import { Table } from "@/components/common/Table/Table";
import { Pagination } from "@/components/common/Pagination/Pagination";
import { FiltersBar } from "../FiltersBar";
import { Card } from "@/components/common/Card/Card";
import type { DataTableProps } from "./types";
import styles from "./DataTable.module.scss";

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

