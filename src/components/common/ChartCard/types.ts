import type { ChartType } from "@/components/common/Chart/Chart";

export interface ChartCardProps {
  title: string;
  type: ChartType;
  data: Array<Record<string, any>>;
  dataKey: string;
  nameKey?: string;
  height?: number;
  className?: string;
}

