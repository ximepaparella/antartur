"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card/Card";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { Textarea } from "@/components/common/Textarea/Textarea";
import { Select } from "@/components/common/Select/Select";
import { ArrayFieldManager } from "../ArrayFieldManager/ArrayFieldManager";
import styles from "./TourForm.module.scss";

interface TourFormProps {
  tour: any;
  isEditing: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
}

type TabType = "basic" | "images" | "content" | "seo" | "pricing" | "relations";

export function TourForm({ tour, isEditing, onSave, onCancel }: TourFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (tour) {
      setFormData(tour);
    }
  }, [tour]);

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "basic", label: "Información Básica" },
    { id: "images", label: "Imágenes" },
    { id: "content", label: "Contenido" },
    { id: "seo", label: "SEO" },
    { id: "pricing", label: "Precios" },
    { id: "relations", label: "Relaciones" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (field: string, subField: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: { ...prev[field], [subField]: value },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === "basic" && (
          <Card title="Información Básica">
            <div className={styles.formGrid}>
              <Input
                label="Nombre"
                value={formData.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={!isEditing}
                required
              />
              <Input
                label="Slug"
                value={formData.slug || ""}
                onChange={(e) => updateField("slug", e.target.value)}
                disabled={!isEditing}
                required
              />
              <Input
                label="Subtítulo"
                value={formData.subtitle || ""}
                onChange={(e) => updateField("subtitle", e.target.value)}
                disabled={!isEditing}
              />
              <Select
                label="Categoría"
                value={formData.category || ""}
                onChange={(e) => updateField("category", e.target.value)}
                disabled={!isEditing}
                options={[
                  { value: "summer", label: "Verano" },
                  { value: "winter", label: "Invierno" },
                  { value: "all-year", label: "Todo el año" },
                ]}
                required
              />
              <Select
                label="Dificultad"
                value={formData.difficulty || ""}
                onChange={(e) => updateField("difficulty", e.target.value)}
                disabled={!isEditing}
                options={[
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
                onChange={(e) => updateField("durationHours", Number(e.target.value))}
                disabled={!isEditing}
                required
              />
              <Input
                label="Edad mínima"
                type="number"
                value={formData.minAge || ""}
                onChange={(e) => updateField("minAge", e.target.value ? Number(e.target.value) : null)}
                disabled={!isEditing}
              />
              <Input
                label="Mínimo de pasajeros"
                type="number"
                value={formData.minPassengers || ""}
                onChange={(e) => updateField("minPassengers", e.target.value ? Number(e.target.value) : null)}
                disabled={!isEditing}
              />
              <div className={styles.checkbox}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => updateField("isActive", e.target.checked)}
                    disabled={!isEditing}
                  />
                  Tour activo
                </label>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "images" && (
          <Card title="Imágenes">
            <div className={styles.formGrid}>
              <Input
                label="Imagen Featured (Card)"
                value={formData.featuredImage || ""}
                onChange={(e) => updateField("featuredImage", e.target.value)}
                disabled={!isEditing}
                placeholder="URL de la imagen"
                required
              />
              <Input
                label="Imagen Hero"
                value={formData.heroImage || ""}
                onChange={(e) => updateField("heroImage", e.target.value)}
                disabled={!isEditing}
                placeholder="URL de la imagen"
                required
              />
              <Input
                label="Subheadline del Hero"
                value={formData.heroSubheadline || ""}
                onChange={(e) => updateField("heroSubheadline", e.target.value)}
                disabled={!isEditing}
                placeholder="Texto que aparece sobre el hero"
              />
              <Input
                label="OG Image (SEO)"
                value={formData.ogImage || ""}
                onChange={(e) => updateField("ogImage", e.target.value)}
                disabled={!isEditing}
                placeholder="URL de la imagen para redes sociales"
              />
              {/* Galería de imágenes se agregará después */}
            </div>
          </Card>
        )}

        {activeTab === "content" && (
          <Card title="Contenido">
            <div className={styles.formGrid}>
              <Textarea
                label="Descripción Corta"
                value={formData.shortDescription || ""}
                onChange={(e) => updateField("shortDescription", e.target.value)}
                disabled={!isEditing}
                rows={4}
                required
              />
              <Textarea
                label="Descripción Larga"
                value={formData.longDescription || ""}
                onChange={(e) => updateField("longDescription", e.target.value)}
                disabled={!isEditing}
                rows={8}
                required
              />
              <Textarea
                label="Texto de Restricciones"
                value={formData.restrictionText || ""}
                onChange={(e) => updateField("restrictionText", e.target.value)}
                disabled={!isEditing}
                rows={4}
                required
              />
              <Textarea
                label="Nota Importante del Timeline"
                value={formData.timelineImportantNote || ""}
                onChange={(e) => updateField("timelineImportantNote", e.target.value)}
                disabled={!isEditing}
                rows={3}
              />
              <Input
                label="Texto Alternativo de Precio"
                value={formData.alternativeText || ""}
                onChange={(e) => updateField("alternativeText", e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: Consultar precio"
              />
              <Input
                label="Precio Alternativo"
                value={formData.alternativePrice || ""}
                onChange={(e) => updateField("alternativePrice", e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: Consultar"
              />
              <Input
                label="CTA Label"
                value={formData.ctaLabel || ""}
                onChange={(e) => updateField("ctaLabel", e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: RESERVAR"
              />
              <Input
                label="CTA Href"
                value={formData.ctaHref || ""}
                onChange={(e) => updateField("ctaHref", e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: #booking"
              />
            </div>
          </Card>
        )}

        {activeTab === "seo" && (
          <Card title="SEO">
            <div className={styles.formGrid}>
              <Input
                label="Meta Title"
                value={formData.metaTitle || ""}
                onChange={(e) => updateField("metaTitle", e.target.value)}
                disabled={!isEditing}
                placeholder="Título para SEO (máx 60 caracteres)"
                maxLength={60}
              />
              <Textarea
                label="Meta Description"
                value={formData.metaDescription || ""}
                onChange={(e) => updateField("metaDescription", e.target.value)}
                disabled={!isEditing}
                rows={3}
                placeholder="Descripción para SEO (máx 160 caracteres)"
                maxLength={160}
              />
              <Input
                label="Canonical URL"
                value={formData.canonicalUrl || ""}
                onChange={(e) => updateField("canonicalUrl", e.target.value)}
                disabled={!isEditing}
                placeholder="URL canónica"
              />
            </div>
          </Card>
        )}

        {activeTab === "pricing" && (
          <Card title="Precios">
            <div className={styles.formGrid}>
              <div className={styles.priceSection}>
                <h4 className={styles.sectionTitle}>Precio ARS</h4>
                <div className={styles.priceRow}>
                  <Input
                    label="Precio Adulto (ARS)"
                    type="number"
                    value={
                      formData.prices?.find((p: any) => p.currency === "ARS")?.priceAdult || ""
                    }
                    onChange={(e) => {
                      const prices = formData.prices || [];
                      const arsIndex = prices.findIndex((p: any) => p.currency === "ARS");
                      if (arsIndex >= 0) {
                        const updated = [...prices];
                        updated[arsIndex] = { ...updated[arsIndex], priceAdult: Number(e.target.value) };
                        updateField("prices", updated);
                      } else {
                        updateField("prices", [
                          ...prices,
                          { currency: "ARS", priceAdult: Number(e.target.value), priceChild: 0 },
                        ]);
                      }
                    }}
                    disabled={!isEditing}
                    placeholder="0"
                  />
                  <Input
                    label="Precio Niño (ARS)"
                    type="number"
                    value={
                      formData.prices?.find((p: any) => p.currency === "ARS")?.priceChild || ""
                    }
                    onChange={(e) => {
                      const prices = formData.prices || [];
                      const arsIndex = prices.findIndex((p: any) => p.currency === "ARS");
                      if (arsIndex >= 0) {
                        const updated = [...prices];
                        updated[arsIndex] = { ...updated[arsIndex], priceChild: Number(e.target.value) };
                        updateField("prices", updated);
                      } else {
                        updateField("prices", [
                          ...prices,
                          { currency: "ARS", priceAdult: 0, priceChild: Number(e.target.value) },
                        ]);
                      }
                    }}
                    disabled={!isEditing}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.priceSection}>
                <h4 className={styles.sectionTitle}>Precio USD</h4>
                <div className={styles.priceRow}>
                  <Input
                    label="Precio Adulto (USD)"
                    type="number"
                    value={
                      formData.prices?.find((p: any) => p.currency === "USD")?.priceAdult || ""
                    }
                    onChange={(e) => {
                      const prices = formData.prices || [];
                      const usdIndex = prices.findIndex((p: any) => p.currency === "USD");
                      if (usdIndex >= 0) {
                        const updated = [...prices];
                        updated[usdIndex] = { ...updated[usdIndex], priceAdult: Number(e.target.value) };
                        updateField("prices", updated);
                      } else {
                        updateField("prices", [
                          ...prices,
                          { currency: "USD", priceAdult: Number(e.target.value), priceChild: 0 },
                        ]);
                      }
                    }}
                    disabled={!isEditing}
                    placeholder="0"
                  />
                  <Input
                    label="Precio Niño (USD)"
                    type="number"
                    value={
                      formData.prices?.find((p: any) => p.currency === "USD")?.priceChild || ""
                    }
                    onChange={(e) => {
                      const prices = formData.prices || [];
                      const usdIndex = prices.findIndex((p: any) => p.currency === "USD");
                      if (usdIndex >= 0) {
                        const updated = [...prices];
                        updated[usdIndex] = { ...updated[usdIndex], priceChild: Number(e.target.value) };
                        updateField("prices", updated);
                      } else {
                        updateField("prices", [
                          ...prices,
                          { currency: "USD", priceAdult: 0, priceChild: Number(e.target.value) },
                        ]);
                      }
                    }}
                    disabled={!isEditing}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "relations" && (
          <div className={styles.relationsTab}>
            <ArrayFieldManager
              title="Timeline Items"
              items={formData.timelineItems || []}
              onAdd={() => {
                const newItem = {
                  id: `temp-${Date.now()}`,
                  timeLabel: "",
                  title: "",
                  description: "",
                  sortOrder: (formData.timelineItems?.length || 0),
                };
                updateField("timelineItems", [...(formData.timelineItems || []), newItem]);
              }}
              onUpdate={(index, item) => {
                const updated = [...(formData.timelineItems || [])];
                updated[index] = item;
                updateField("timelineItems", updated);
              }}
              onDelete={(index) => {
                const filtered = (formData.timelineItems || []).filter((_, i) => i !== index);
                updateField("timelineItems", filtered);
              }}
              renderItem={(item, index, isEditingItem, onUpdate) => (
                <div className={styles.timelineItem}>
                  <Input
                    label="Hora"
                    value={item.timeLabel || ""}
                    onChange={(e) => onUpdate({ ...item, timeLabel: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                    placeholder="Ej: 9:00 AM"
                  />
                  <Input
                    label="Título"
                    value={item.title || ""}
                    onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                  />
                  <Textarea
                    label="Descripción"
                    value={item.description || ""}
                    onChange={(e) => onUpdate({ ...item, description: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                    rows={3}
                  />
                </div>
              )}
              getDefaultItem={() => ({
                id: `temp-${Date.now()}`,
                timeLabel: "",
                title: "",
                description: "",
                sortOrder: formData.timelineItems?.length || 0,
              })}
              disabled={!isEditing}
            />

            <ArrayFieldManager
              title="Featured Info Items"
              items={formData.featuredInfos || []}
              onAdd={() => {
                const newItem = {
                  id: `temp-${Date.now()}`,
                  icon: "",
                  title: "",
                  description: "",
                  sortOrder: (formData.featuredInfos?.length || 0),
                };
                updateField("featuredInfos", [...(formData.featuredInfos || []), newItem]);
              }}
              onUpdate={(index, item) => {
                const updated = [...(formData.featuredInfos || [])];
                updated[index] = item;
                updateField("featuredInfos", updated);
              }}
              onDelete={(index) => {
                const filtered = (formData.featuredInfos || []).filter((_, i) => i !== index);
                updateField("featuredInfos", filtered);
              }}
              renderItem={(item, index, isEditingItem, onUpdate) => (
                <div className={styles.featuredInfoItem}>
                  <Input
                    label="Icono"
                    value={item.icon || ""}
                    onChange={(e) => onUpdate({ ...item, icon: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                    placeholder="Ej: clock, difficulty, family"
                  />
                  <Input
                    label="Título"
                    value={item.title || ""}
                    onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                  />
                  <Textarea
                    label="Descripción"
                    value={item.description || ""}
                    onChange={(e) => onUpdate({ ...item, description: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                    rows={2}
                  />
                </div>
              )}
              getDefaultItem={() => ({
                id: `temp-${Date.now()}`,
                icon: "",
                title: "",
                description: "",
                sortOrder: formData.featuredInfos?.length || 0,
              })}
              disabled={!isEditing}
            />

            <ArrayFieldManager
              title="Testimonials"
              items={formData.testimonials || []}
              onAdd={() => {
                const newItem = {
                  id: `temp-${Date.now()}`,
                  text: "",
                  author: "",
                  avatar: "",
                  country: "",
                  sortOrder: (formData.testimonials?.length || 0),
                };
                updateField("testimonials", [...(formData.testimonials || []), newItem]);
              }}
              onUpdate={(index, item) => {
                const updated = [...(formData.testimonials || [])];
                updated[index] = item;
                updateField("testimonials", updated);
              }}
              onDelete={(index) => {
                const filtered = (formData.testimonials || []).filter((_, i) => i !== index);
                updateField("testimonials", filtered);
              }}
              renderItem={(item, index, isEditingItem, onUpdate) => (
                <div className={styles.testimonialItem}>
                  <Textarea
                    label="Texto del Testimonio"
                    value={item.text || ""}
                    onChange={(e) => onUpdate({ ...item, text: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                    rows={3}
                  />
                  <Input
                    label="Autor"
                    value={item.author || ""}
                    onChange={(e) => onUpdate({ ...item, author: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                  />
                  <Input
                    label="Avatar (URL)"
                    value={item.avatar || ""}
                    onChange={(e) => onUpdate({ ...item, avatar: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                    placeholder="URL de la imagen del avatar"
                  />
                  <Input
                    label="País"
                    value={item.country || ""}
                    onChange={(e) => onUpdate({ ...item, country: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                  />
                </div>
              )}
              getDefaultItem={() => ({
                id: `temp-${Date.now()}`,
                text: "",
                author: "",
                avatar: "",
                country: "",
                sortOrder: formData.testimonials?.length || 0,
              })}
              disabled={!isEditing}
            />

            <ArrayFieldManager
              title="QuickInfo Items"
              items={formData.quickInfoItems || []}
              onAdd={() => {
                const newItem = {
                  id: `temp-${Date.now()}`,
                  icon: "",
                  label: "",
                  value: "",
                  sortOrder: (formData.quickInfoItems?.length || 0),
                };
                updateField("quickInfoItems", [...(formData.quickInfoItems || []), newItem]);
              }}
              onUpdate={(index, item) => {
                const updated = [...(formData.quickInfoItems || [])];
                updated[index] = item;
                updateField("quickInfoItems", updated);
              }}
              onDelete={(index) => {
                const filtered = (formData.quickInfoItems || []).filter((_, i) => i !== index);
                updateField("quickInfoItems", filtered);
              }}
              renderItem={(item, index, isEditingItem, onUpdate) => (
                <div className={styles.quickInfoItem}>
                  <Input
                    label="Icono"
                    value={item.icon || ""}
                    onChange={(e) => onUpdate({ ...item, icon: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                    placeholder="Ej: clock, difficulty"
                  />
                  <Input
                    label="Label"
                    value={item.label || ""}
                    onChange={(e) => onUpdate({ ...item, label: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                    placeholder="Ej: Duración"
                  />
                  <Input
                    label="Valor"
                    value={item.value || ""}
                    onChange={(e) => onUpdate({ ...item, value: e.target.value })}
                    disabled={!isEditingItem || !isEditing}
                    placeholder="Ej: 4 horas"
                  />
                </div>
              )}
              getDefaultItem={() => ({
                id: `temp-${Date.now()}`,
                icon: "",
                label: "",
                value: "",
                sortOrder: formData.quickInfoItems?.length || 0,
              })}
              disabled={!isEditing}
            />

            <ArrayFieldManager
              title="Galería de Imágenes"
              items={formData.images?.filter((img: any) => img.imageType === "GALLERY") || []}
              onAdd={() => {
                const newItem = {
                  id: `temp-${Date.now()}`,
                  imageType: "GALLERY",
                  url: "",
                  altText: "",
                  sortOrder: (formData.images?.filter((img: any) => img.imageType === "GALLERY")?.length || 0),
                };
                updateField("images", [...(formData.images || []), newItem]);
              }}
              onUpdate={(index, item) => {
                const galleryImages = formData.images?.filter((img: any) => img.imageType === "GALLERY") || [];
                const otherImages = formData.images?.filter((img: any) => img.imageType !== "GALLERY") || [];
                const updated = [...galleryImages];
                updated[index] = item;
                updateField("images", [...otherImages, ...updated]);
              }}
              onDelete={(index) => {
                const galleryImages = formData.images?.filter((img: any) => img.imageType === "GALLERY") || [];
                const otherImages = formData.images?.filter((img: any) => img.imageType !== "GALLERY") || [];
                const filtered = galleryImages.filter((_, i) => i !== index);
                updateField("images", [...otherImages, ...filtered]);
              }}
              renderItem={(item, index, isEditingItem, onUpdate) => (
                <div className={styles.galleryItem}>
                  <Input
                    label="URL de la Imagen"
                    value={item.url || ""}
                    onChange={(e) => {
                      const galleryImages = formData.images?.filter((img: any) => img.imageType === "GALLERY") || [];
                      const otherImages = formData.images?.filter((img: any) => img.imageType !== "GALLERY") || [];
                      const updated = [...galleryImages];
                      updated[index] = { ...item, url: e.target.value };
                      updateField("images", [...otherImages, ...updated]);
                      onUpdate({ ...item, url: e.target.value });
                    }}
                    disabled={!isEditingItem || !isEditing}
                    placeholder="URL de la imagen"
                  />
                  <Input
                    label="Alt Text"
                    value={item.altText || ""}
                    onChange={(e) => {
                      const galleryImages = formData.images?.filter((img: any) => img.imageType === "GALLERY") || [];
                      const otherImages = formData.images?.filter((img: any) => img.imageType !== "GALLERY") || [];
                      const updated = [...galleryImages];
                      updated[index] = { ...item, altText: e.target.value };
                      updateField("images", [...otherImages, ...updated]);
                      onUpdate({ ...item, altText: e.target.value });
                    }}
                    disabled={!isEditingItem || !isEditing}
                    placeholder="Texto alternativo"
                  />
                  {item.url && (
                    <div className={styles.imagePreview}>
                      <img src={item.url} alt={item.altText || "Preview"} />
                    </div>
                  )}
                </div>
              )}
              getDefaultItem={() => ({
                id: `temp-${Date.now()}`,
                imageType: "GALLERY",
                url: "",
                altText: "",
                sortOrder: formData.images?.filter((img: any) => img.imageType === "GALLERY")?.length || 0,
              })}
              disabled={!isEditing}
            />
          </div>
        )}
      </div>

      {isEditing && (
        <div className={styles.formActions}>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Cambios
          </Button>
        </div>
      )}
    </form>
  );
}

