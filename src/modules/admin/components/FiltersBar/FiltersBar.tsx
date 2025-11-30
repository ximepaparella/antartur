"use client";

import { Input } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import { Button } from "@/components/common/Button/Button";
import styles from "./FiltersBar.module.scss";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select";
  options?: FilterOption[];
  placeholder?: string;
}

interface FiltersBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClear?: () => void;
  className?: string;
}

export function FiltersBar({
  filters,
  values,
  onFilterChange,
  onClear,
  className = "",
}: FiltersBarProps) {
  const hasActiveFilters = Object.values(values).some((v) => v && v !== "");

  return (
    <div className={`${styles.filtersBar} ${className}`.trim()}>
      <div className={styles.filters}>
        {filters.map((filter) => {
          if (filter.type === "select") {
            return (
              <div key={filter.key} className={styles.filterItem}>
                <Select
                  label={filter.label}
                  value={values[filter.key] || ""}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  options={filter.options || []}
                />
              </div>
            );
          }

          return (
            <div key={filter.key} className={styles.filterItem}>
              <Input
                label={filter.label}
                type="text"
                value={values[filter.key] || ""}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
              />
            </div>
          );
        })}
      </div>

      {hasActiveFilters && onClear && (
        <div className={styles.actions}>
          <Button variant="outline" size="small" onClick={onClear}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}

