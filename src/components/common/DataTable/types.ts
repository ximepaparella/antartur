import type { TableColumn } from "@/components/common/Table/Table";
import type { FilterConfig } from "../FiltersBar/types";

export interface DataTableProps<T = any> {
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

