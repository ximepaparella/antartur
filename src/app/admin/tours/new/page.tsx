"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { Card } from "@/components/common/Card/Card";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { Textarea } from "@/components/common/Textarea/Textarea";
import { Select } from "@/components/common/Select/Select";
import { ImagePicker } from "@/modules/tours/components/admin/ImagePicker";
import { generateSlug } from "@/lib/utils/slug";
import { normalizeDifficultyForForm } from "@/modules/tours/lib/difficulty";
import styles from "./page.module.scss";

export default function AdminTourCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    difficulty: "",
    durationHours: 0,
    featuredImage: "",
    heroImage: "",
    shortDescription: "",
    longDescription: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Auto-generar slug cuando cambie el nombre
  useEffect(() => {
    if (formData.name) {
      const newSlug = generateSlug(formData.name);
      if (newSlug && newSlug !== formData.slug) {
        setFormData((prev) => ({ ...prev, slug: newSlug }));
      }
    }
  }, [formData.name, formData.slug]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push("Nombre es requerido");
    if (!formData.category) errors.push("Categoría es requerida");
    if (!formData.difficulty) errors.push("Dificultad es requerida");
    if (!formData.durationHours || formData.durationHours <= 0) errors.push("Duración debe ser mayor a 0");
    if (!formData.featuredImage.trim()) errors.push("Imagen destacada es requerida");
    if (!formData.heroImage.trim()) errors.push("Imagen hero es requerida");
    if (!formData.shortDescription.trim()) errors.push("Descripción corta es requerida");
    if (!formData.longDescription.trim()) errors.push("Descripción larga es requerida");
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Asegurar que el slug esté generado antes de enviar
      const dataToSend = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
      };
      
      const response = await adminApiClient.createTour(dataToSend);
      if (response.success && response.data) {
        router.push(`/admin/tours/${response.data.id}`);
      } else {
        setError("Error al crear tour");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="outline" onClick={() => router.push("/admin/tours")}>
          ← Volver
        </Button>
        <h1 className={styles.title}>Nuevo Tour</h1>
      </div>

      <Card title="Información Básica">
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nombre *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Nombre del tour"
          />
          <div className={styles.categorySection}>
            <label className={styles.categoryLabel}>Categoría *</label>
            <div className={styles.categoryCheckboxes}>
              {[
                { value: "winter", label: "Invierno" },
                { value: "summer", label: "Verano" },
              ].map((cat) => {
                const categories = (formData.category || "").split(",").filter(Boolean);
                const isChecked = categories.includes(cat.value);
                return (
                  <label key={cat.value} className={styles.categoryCheckbox}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        let newCategories = [...categories];
                        if (e.target.checked) {
                          if (!newCategories.includes(cat.value)) {
                            newCategories.push(cat.value);
                          }
                        } else {
                          newCategories = newCategories.filter(c => c !== cat.value);
                        }
                        setFormData({ ...formData, category: newCategories.join(",") });
                      }}
                    />
                    <span>{cat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <Select
            label="Dificultad"
            value={normalizeDifficultyForForm(formData.difficulty)}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            options={[
              { value: "", label: "Seleccionar..." },
              { value: "Baja", label: "Baja" },
              { value: "Media", label: "Media" },
              { value: "Alta", label: "Alta" },
            ]}
            required
          />
          <Input
            label="Duración (horas)"
            type="number"
            value={formData.durationHours || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                durationHours: Number(e.target.value),
              })
            }
            required
            min={1}
          />
          <ImagePicker
            label="Imagen Featured (Card) *"
            value={formData.featuredImage}
            onChange={(url) => setFormData({ ...formData, featuredImage: url })}
            tourSlug={formData.slug || generateSlug(formData.name || "") || "default"}
            imageType="featured"
          />
          <ImagePicker
            label="Imagen Hero *"
            value={formData.heroImage}
            onChange={(url) => setFormData({ ...formData, heroImage: url })}
            tourSlug={formData.slug || generateSlug(formData.name || "") || "default"}
            imageType="hero"
          />
          <Textarea
            label="Descripción Corta"
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData({ ...formData, shortDescription: e.target.value })
            }
            required
            rows={3}
            placeholder="Breve descripción del tour (para listados)"
          />
          <Textarea
            label="Descripción Larga"
            value={formData.longDescription}
            onChange={(e) =>
              setFormData({ ...formData, longDescription: e.target.value })
            }
            required
            rows={6}
            placeholder="Descripción completa del tour"
          />

          {validationErrors.length > 0 && (
            <div className={styles.validationErrors}>
              <strong>Por favor corrige los siguientes errores:</strong>
              <ul>
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <Button variant="outline" type="button" onClick={() => router.push("/admin/tours")}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Tour"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

