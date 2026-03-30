"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, X, Image as ImageIcon, Link } from "lucide-react";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { createAuthHeaders } from "@/modules/admin/lib/authHelpers";
import type { ImagePickerProps } from "@/modules/tours/types/admin";
import styles from "./ImagePicker.module.scss";

export function ImagePicker({
  value,
  onChange,
  tourSlug,
  imageType,
  label,
  disabled = false,
  placeholder = "URL de la imagen o sube una nueva",
}: ImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tourSlug", tourSlug);
      formData.append("imageType", imageType);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: createAuthHeaders(),
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onChange(result.data.url);
      } else {
        setError(result.error || "Error al subir la imagen");
      }
    } catch (err) {
      setError("Error de conexión al subir la imagen");
    } finally {
      setIsUploading(false);
      // Reset input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    onChange("");
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.imagePicker}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.container}>
        {/* Preview */}
        <div className={styles.preview}>
          {value ? (
            <img src={value} alt="Preview" className={styles.image} />
          ) : (
            <div className={styles.placeholder}>
              <ImageIcon size={32} />
              <span>Sin imagen</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          {!disabled && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className={styles.fileInput}
                disabled={isUploading}
              />

              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={triggerFileInput}
                disabled={isUploading}
              >
                <Upload size={16} />
                {isUploading ? "Subiendo..." : "Subir"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <Link size={16} />
                URL
              </Button>

              {value && (
                <Button
                  type="button"
                  variant="outline"
                  size="small"
                  onClick={handleRemove}
                  className={styles.removeBtn}
                >
                  <X size={16} />
                  Quitar
                </Button>
              )}
            </>
          )}
        </div>

        {/* URL Input */}
        {showUrlInput && !disabled && (
          <div className={styles.urlInput}>
            <Input
              type="text"
              value={value}
              onChange={handleUrlChange}
              placeholder={placeholder}
              disabled={disabled}
            />
          </div>
        )}

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

