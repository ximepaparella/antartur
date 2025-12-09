import { Chart } from "@/components/common/Chart/Chart";
import type { ChartCardProps } from "./types";
import styles from "./ChartCard.module.scss";

export function ChartCard({
  title,
  type,
  data,
  dataKey,
  nameKey,
  height = 300,
  className = "",
}: ChartCardProps) {
  return (
    <div className={`${styles.chartCard} ${className}`.trim()}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.chartContainer}>
        <Chart
          type={type}
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          height={height}
        />
      </div>
    </div>
  );
}

