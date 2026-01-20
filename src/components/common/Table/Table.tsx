import React from "react";
import styles from "./Table.module.scss";

type TableColumnKey<T> = Extract<keyof T, string>;

export interface TableColumn<T = unknown> {
  key: TableColumnKey<T>;
  label: string;
  render?: (value: T[TableColumnKey<T>], row: T) => React.ReactNode;
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
  const toCellContent = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return "";
    if (React.isValidElement(value)) return value;
    switch (typeof value) {
      case "string":
      case "number":
      case "boolean":
      case "bigint":
        return String(value);
      default:
        return String(value);
    }
  };

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
                const value = row[column.key];
                const content = column.render
                  ? column.render(value, row)
                  : toCellContent(value);

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
