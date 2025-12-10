"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, X, Image as ImageIcon, Link } from "lucide-react";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import styles from "./AvatarPicker.module.scss";

interface AvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function AvatarPicker({
  value,
  onChange,
  label,
  disabled = false,
  placeholder = "URL del avatar o sube una nueva",
}: AvatarPickerProps) {
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

      const response = await fetch("/api/admin/upload/testimonial", {
        method: "POST",
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

    // Si es una URL local, intentar eliminar el archivo
    if (value.startsWith("/images/testimonials/")) {
      try {
        await fetch(`/api/admin/upload/testimonial?url=${encodeURIComponent(value)}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Error al eliminar archivo:", err);
      }
    }

    onChange("");
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.avatarPicker}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.container}>
        {/* Preview */}
        <div className={styles.preview}>
          {value ? (
            <img src={value} alt="Avatar preview" className={styles.image} />
          ) : (
            <div className={styles.placeholder}>
              <ImageIcon size={32} />
              <span>Sin avatar</span>
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
