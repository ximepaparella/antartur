"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./Chart.module.scss";

export type ChartType = "line" | "bar" | "pie";

interface ChartProps {
  type: ChartType;
  data: Array<Record<string, any>>;
  dataKey: string;
  nameKey?: string;
  colors?: string[];
  height?: number;
  className?: string;
}

const DEFAULT_COLORS = [
  "#24384d", // primary-color
  "#4054B2", // secondary-color
  "#6fa5cb", // tertiary-color
  "#be9794", // gray-600
  "#dc3545", // error-color
];

export function Chart({
  type,
  data,
  dataKey,
  nameKey = "name",
  colors = DEFAULT_COLORS,
  height = 300,
  className = "",
}: ChartProps) {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={2}
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill={colors[0]} />
          </BarChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${styles.chart} ${className}`.trim()}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

