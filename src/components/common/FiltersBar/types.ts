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

export interface FiltersBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClear?: () => void;
  className?: string;
}

