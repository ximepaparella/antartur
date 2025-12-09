"use client";

import { useState, useEffect } from "react";
import { adminApiClient } from "../lib/adminApiClient";

export interface DashboardStats {
  tours: {
    total: number;
    active: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
  };
  bookings: {
    total: number;
    confirmed: number;
  };
  revenue: {
    total: number;
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminApiClient.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || "Failed to fetch stats");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, isLoading, error, refetch: fetchStats };
}

