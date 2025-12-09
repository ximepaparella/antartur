"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Edit2 } from "lucide-react";
import type { GalleryImage } from "@/modules/tours/types/admin";
import styles from "./GalleryManager.module.scss";

interface SortableImageProps {
  image: GalleryImage;
  onRemove: () => void;
  onEdit: () => void;
  disabled?: boolean;
}

export function SortableImage({ image, onRemove, onEdit, disabled }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.imageCard} ${isDragging ? styles.dragging : ""}`}
    >
      {!disabled && (
        <button
          type="button"
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      )}

      <div className={styles.imagePreview}>
        <img src={image.url} alt={image.altText || "Gallery image"} />
      </div>

      <div className={styles.imageInfo}>
        <span className={styles.altText}>{image.altText || "Sin alt text"}</span>
        <span className={styles.order}>#{image.sortOrder + 1}</span>
      </div>

      {!disabled && (
        <div className={styles.imageActions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={onEdit}
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.removeBtn}`}
            onClick={onRemove}
            title="Eliminar"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

