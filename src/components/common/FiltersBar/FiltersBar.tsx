"use client";

import { Input } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import { Button } from "@/components/common/Button/Button";
import type { FiltersBarProps } from "./types";
import styles from "./FiltersBar.module.scss";

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

