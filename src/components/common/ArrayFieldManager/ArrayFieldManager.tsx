"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { Card } from "@/components/common/Card/Card";
import type { ArrayFieldManagerProps } from "./types";
import styles from "./ArrayFieldManager.module.scss";

export function ArrayFieldManager<T extends { id?: string; sortOrder?: number }>({
  items,
  title,
  onAdd,
  onUpdate,
  onDelete,
  renderItem,
  getDefaultItem,
  disabled = false,
}: ArrayFieldManagerProps<T>) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = () => {
    const newItem = getDefaultItem();
    onAdd();
    // El nuevo item se agregará al array padre, así que abrimos el modo edición para el último item
    setEditingIndex(items.length);
  };

  const handleSave = (index: number) => {
    setEditingIndex(null);
  };

  const handleCancel = (index: number) => {
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if (confirm("¿Estás seguro de eliminar este item?")) {
      onDelete(index);
      if (editingIndex === index) {
        setEditingIndex(null);
      } else if (editingIndex !== null && editingIndex > index) {
        // Ajustar el índice de edición si eliminamos un item antes del que está siendo editado
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const handleItemUpdate = (index: number, updatedItem: T) => {
    onUpdate(index, updatedItem);
  };

  return (
    <div className={styles.arrayFieldManager}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {!disabled && (
          <Button variant="primary" size="small" onClick={handleAdd}>
            + Agregar
          </Button>
        )}
      </div>

      <div className={styles.items}>
        {items.length === 0 ? (
          <p className={styles.empty}>No hay items. Haz clic en &quot;Agregar&quot; para crear uno.</p>
        ) : (
          items.map((item, index) => (
            <Card key={item.id || `temp-${index}`} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <span className={styles.itemNumber}>#{index + 1}</span>
                {!disabled && (
                  <div className={styles.itemActions}>
                    {editingIndex === index ? (
                      <>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleSave(index)}
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleCancel(index)}
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => setEditingIndex(index)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleDelete(index)}
                        >
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.itemContent}>
                {renderItem(item, index, editingIndex === index, (updatedItem) =>
                  handleItemUpdate(index, updatedItem)
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

