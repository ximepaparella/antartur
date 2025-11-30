"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import { Card } from "@/components/common/Card/Card";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import styles from "./page.module.scss";

export default function AdminTourCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    difficulty: "",
    durationHours: 0,
    shortDescription: "",
    longDescription: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApiClient.createTour(formData);
      if (response.success && response.data) {
        router.push(`/admin/tours/${response.data.id}`);
      } else {
        setError(response.error || "Error al crear tour");
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
            label="Nombre"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value })
            }
            required
          />
          <Input
            label="Categoría"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          />
          <Input
            label="Dificultad"
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            required
          />
          <Input
            label="Duración (horas)"
            type="number"
            value={formData.durationHours}
            onChange={(e) =>
              setFormData({
                ...formData,
                durationHours: Number(e.target.value),
              })
            }
            required
          />

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

