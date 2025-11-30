"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseDataTableOptions<T> {
  fetchData: (params: {
    page: number;
    limit: number;
    filters?: Record<string, string>;
  }) => Promise<{
    success: boolean;
    data?: T[];
    meta?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    error?: string;
  }>;
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: Record<string, string>;
}

export function useDataTable<T = any>({
  fetchData,
  initialPage = 1,
  initialLimit = 10,
  initialFilters = {},
}: UseDataTableOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  // Usar useRef para almacenar la función fetchData y evitar recreaciones
  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchDataRef.current({ page, limit, filters });
      if (response.success && response.data) {
        setData(response.data);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        setError(response.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]); // Removido fetchData de las dependencias

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
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
  };
}

