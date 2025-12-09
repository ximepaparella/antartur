"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { Card } from "@/components/common/Card/Card";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { Textarea } from "@/components/common/Textarea/Textarea";
import { Select } from "@/components/common/Select/Select";
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
    restrictionText: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push("Nombre es requerido");
    if (!formData.slug.trim()) errors.push("Slug es requerido");
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
      const response = await adminApiClient.createTour(formData);
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

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
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
            label="Nombre"
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({ 
                ...formData, 
                name,
                slug: formData.slug || generateSlug(name)
              });
            }}
            required
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value })
            }
            required
            placeholder="url-amigable-del-tour"
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
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            options={[
              { value: "", label: "Seleccionar..." },
              { value: "bajo", label: "Bajo" },
              { value: "medio", label: "Medio" },
              { value: "dificil", label: "Difícil" },
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
          <Input
            label="Imagen Destacada (URL)"
            value={formData.featuredImage}
            onChange={(e) =>
              setFormData({ ...formData, featuredImage: e.target.value })
            }
            required
            placeholder="/imagenes/tour-destacada.jpg o https://..."
          />
          <Input
            label="Imagen Hero (URL)"
            value={formData.heroImage}
            onChange={(e) =>
              setFormData({ ...formData, heroImage: e.target.value })
            }
            required
            placeholder="/imagenes/tour-hero.jpg o https://..."
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

