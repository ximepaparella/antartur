import React from "react";
import styles from "./Table.module.scss";

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

interface TableProps<T = unknown> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
}

export function Table<T = unknown>({
  columns,
  data,
  onRowClick,
  className = "",
  emptyMessage = "No hay datos disponibles",
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={`${styles.table} ${className}`.trim()}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.align ? styles[column.align] : ""}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? styles.clickable : ""}
            >
              {columns.map((column) => {
                const value = (row as any)[column.key];
                const content = column.render
                  ? column.render(value, row)
                  : value;

                return (
                  <td
                    key={column.key}
                    className={column.align ? styles[column.align] : ""}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
