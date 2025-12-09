export interface MetricTrend {
  value: number;
  label: string;
  positive?: boolean;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: MetricTrend;
  className?: string;
}

