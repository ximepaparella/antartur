"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { SortableImage } from "./SortableImage";
import { createAuthHeaders } from "@/modules/admin/lib/authHelpers";
import type { GalleryManagerProps, GalleryImage } from "@/modules/tours/types/admin";
import styles from "./GalleryManager.module.scss";

export function GalleryManager({
  images,
  onChange,
  tourSlug,
  disabled = false,
}: GalleryManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const reordered = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
        ...img,
        sortOrder: index,
      }));

      onChange(reordered);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const newImages: GalleryImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tourSlug", tourSlug);
        formData.append("imageType", "gallery");

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          headers: createAuthHeaders(),
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          newImages.push({
            id: `temp-${Date.now()}-${i}`,
            url: result.data.url,
            altText: "",
            sortOrder: images.length + i,
            imageType: "GALLERY",
          });
        } else {
          setError(result.error || `Error al subir ${file.name}`);
        }
      } catch (err) {
        setError(`Error de conexión al subir ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }

    setIsUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (id: string) => {
    const filtered = images
      .filter((img) => img.id !== id)
      .map((img, index) => ({ ...img, sortOrder: index }));
    
    onChange(filtered);
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setEditAltText(image.altText);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const updated = images.map((img) =>
      img.id === editingId ? { ...img, altText: editAltText } : img
    );
    
    onChange(updated);
    setEditingId(null);
    setEditAltText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAltText("");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.galleryManager}>
      <div className={styles.header}>
        <h3 className={styles.title}>Galería de Imágenes</h3>
        {!disabled && (
          <div className={styles.uploadControls}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className={styles.fileInput}
              multiple
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="primary"
              size="small"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              <Upload size={16} />
              {isUploading ? "Subiendo..." : "Subir imágenes"}
            </Button>
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {editingId && (
        <div className={styles.editModal}>
          <div className={styles.editContent}>
            <h4>Editar Alt Text</h4>
            <Input
              label="Texto alternativo"
              value={editAltText}
              onChange={(e) => setEditAltText(e.target.value)}
              placeholder="Descripción de la imagen"
            />
            <div className={styles.editActions}>
              <Button variant="outline" size="small" onClick={handleCancelEdit}>
                Cancelar
              </Button>
              <Button variant="primary" size="small" onClick={handleSaveEdit}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay imágenes en la galería</p>
          {!disabled && (
            <Button variant="outline" onClick={triggerFileInput}>
              <Plus size={16} />
              Agregar primera imagen
            </Button>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
            <div className={styles.imageGrid}>
              {images.map((image) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  onRemove={() => handleRemove(image.id)}
                  onEdit={() => handleEdit(image)}
                  disabled={disabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <p className={styles.hint}>
        {disabled
          ? "Activa el modo edición para modificar la galería"
          : "Arrastra las imágenes para reordenarlas"}
      </p>
    </div>
  );
}

