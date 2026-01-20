"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card/Card";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { Textarea } from "@/components/common/Textarea/Textarea";
import { Select } from "@/components/common/Select/Select";
import { ArrayFieldManager } from "@/components/common/ArrayFieldManager";
import { ImagePicker } from "@/modules/tours/components/admin/ImagePicker";
import { IconPicker } from "@/modules/tours/components/admin/IconPicker";
import { GalleryManager } from "@/modules/tours/components/admin/GalleryManager";
import { AvailabilityManager } from "@/modules/tours/components/admin/AvailabilityManager";
import type { TourFormProps } from "@/modules/tours/types/admin";
import type {
  TourFormData,
  TourImage,
  TourPrice,
  QuickInfoItem,
  FeaturedInfo,
  TimelineItem,
  Testimonial,
} from "@/modules/tours/components/admin/TourForm/types";
import styles from "./TourForm.module.scss";

export function TourForm({ tour, isEditing, onSave, onCancel }: TourFormProps) {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [formData, setFormData] = useState<TourFormData>({});

  useEffect(() => {
    if (tour) {
      setFormData(tour);
    }
  }, [tour]);

  const tabs: Array<{ id: string; label: string }> = [
    { id: "basic", label: "Información Básica" },
    { id: "images", label: "Imágenes" },
    { id: "content", label: "Contenido" },
    { id: "availability", label: "Disponibilidad" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const updateField = (field: string, value: unknown) => {
    setFormData((prev: TourFormData) => ({ ...prev, [field]: value }));
  };

  // Helper para obtener imágenes de galería
  const getGalleryImages = () => {
    return (formData.images || [])
      .filter((img: TourImage) => img.imageType === "GALLERY")
      .map((img: TourImage, index: number) => ({
        ...img,
        id: img.id || `gallery-${Date.now()}-${index}`,
        altText: img.altText || "",
        sortOrder: index,
      }));
  };

  // Helper para actualizar imágenes de galería
  const updateGalleryImages = (galleryImages: TourImage[]) => {
    const otherImages = (formData.images || []).filter(
      (img: TourImage) => img.imageType !== "GALLERY",
    );
    updateField("images", [...otherImages, ...galleryImages]);
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
                onChange={(e) =>
                  updateField("durationHours", Number(e.target.value))
                }
                disabled={!isEditing}
                required
              />
              <Input
                label="Edad mínima"
                type="number"
                value={formData.minAge || ""}
                onChange={(e) =>
                  updateField(
                    "minAge",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                disabled={!isEditing}
              />
              <Input
                label="Mínimo de pasajeros"
                type="number"
                value={formData.minPassengers || ""}
                onChange={(e) =>
                  updateField(
                    "minPassengers",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
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

            <div className={styles.weekdaysCard}>
              <Card title="Días de Semana Disponibles">
                <p className={styles.weekdaysDescription}>
                  Selecciona los días de la semana en que este tour está
                  disponible.
                </p>
                <div className={styles.weekdaysGrid}>
                  {[
                    { key: "mondayAvailable", label: "Lunes" },
                    { key: "tuesdayAvailable", label: "Martes" },
                    { key: "wednesdayAvailable", label: "Miércoles" },
                    { key: "thursdayAvailable", label: "Jueves" },
                    { key: "fridayAvailable", label: "Viernes" },
                    { key: "saturdayAvailable", label: "Sábado" },
                    { key: "sundayAvailable", label: "Domingo" },
                  ].map((day) => (
                    <div key={day.key} className={styles.weekdayCheckbox}>
                      <label>
                        <input
                          type="checkbox"
                          checked={
                            (formData[
                              day.key as keyof TourFormData
                            ] as boolean) ?? true
                          }
                          onChange={(e) =>
                            updateField(
                              day.key as keyof TourFormData,
                              e.target.checked,
                            )
                          }
                          disabled={!isEditing}
                        />
                        <span>{day.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Card>
        )}

        {activeTab === "images" && (
          <div className={styles.imagesTab}>
            <Card title="Imágenes Principales">
              <div className={styles.imagePickersGrid}>
                <ImagePicker
                  label="Imagen Featured (Card)"
                  value={formData.featuredImage || ""}
                  onChange={(url) => updateField("featuredImage", url)}
                  tourSlug={formData.slug || "default"}
                  imageType="featured"
                  disabled={!isEditing}
                />
                <ImagePicker
                  label="Imagen Hero"
                  value={formData.heroImage || ""}
                  onChange={(url) => updateField("heroImage", url)}
                  tourSlug={formData.slug || "default"}
                  imageType="hero"
                  disabled={!isEditing}
                />
              </div>
              <div className={styles.formGrid}>
                <Input
                  label="Subheadline del Hero"
                  value={formData.heroSubheadline || ""}
                  onChange={(e) =>
                    updateField("heroSubheadline", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="Texto que aparece sobre el hero"
                />
                <Input
                  label="OG Image URL (SEO)"
                  value={formData.ogImage || ""}
                  onChange={(e) => updateField("ogImage", e.target.value)}
                  disabled={!isEditing}
                  placeholder="URL de la imagen para redes sociales"
                />
              </div>
            </Card>

            <GalleryManager
              images={getGalleryImages()}
              onChange={updateGalleryImages}
              tourSlug={formData.slug || "default"}
              disabled={!isEditing}
            />
          </div>
        )}

        {activeTab === "content" && (
          <Card title="Contenido">
            <div className={styles.formGrid}>
              <Textarea
                label="Descripción Corta"
                value={formData.shortDescription || ""}
                onChange={(e) =>
                  updateField("shortDescription", e.target.value)
                }
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
                onChange={(e) =>
                  updateField("timelineImportantNote", e.target.value)
                }
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
                onChange={(e) =>
                  updateField("alternativePrice", e.target.value)
                }
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
                      formData.prices?.find(
                        (p: TourPrice) => p.currency === "ARS",
                      )?.priceAdult || ""
                    }
                    onChange={(e) => {
                      const prices = formData.prices || [];
                      const arsIndex = prices.findIndex(
                        (p: TourPrice) => p.currency === "ARS",
                      );
                      if (arsIndex >= 0) {
                        const updated = [...prices];
                        updated[arsIndex] = {
                          ...updated[arsIndex],
                          priceAdult: Number(e.target.value),
                        };
                        updateField("prices", updated);
                      } else {
                        updateField("prices", [
                          ...prices,
                          {
                            currency: "ARS",
                            priceAdult: Number(e.target.value),
                            priceChild: 0,
                          },
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
                      formData.prices?.find(
                        (p: TourPrice) => p.currency === "ARS",
                      )?.priceChild || ""
                    }
                    onChange={(e) => {
                      const prices = formData.prices || [];
                      const arsIndex = prices.findIndex(
                        (p: TourPrice) => p.currency === "ARS",
                      );
                      if (arsIndex >= 0) {
                        const updated = [...prices];
                        updated[arsIndex] = {
                          ...updated[arsIndex],
                          priceChild: Number(e.target.value),
                        };
                        updateField("prices", updated);
                      } else {
                        updateField("prices", [
                          ...prices,
                          {
                            currency: "ARS",
                            priceAdult: 0,
                            priceChild: Number(e.target.value),
                          },
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
                      formData.prices?.find(
                        (p: TourPrice) => p.currency === "USD",
                      )?.priceAdult || ""
                    }
                    onChange={(e) => {
                      const prices = formData.prices || [];
                      const usdIndex = prices.findIndex(
                        (p: TourPrice) => p.currency === "USD",
                      );
                      if (usdIndex >= 0) {
                        const updated = [...prices];
                        updated[usdIndex] = {
                          ...updated[usdIndex],
                          priceAdult: Number(e.target.value),
                        };
                        updateField("prices", updated);
                      } else {
                        updateField("prices", [
                          ...prices,
                          {
                            currency: "USD",
                            priceAdult: Number(e.target.value),
                            priceChild: 0,
                          },
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
                      formData.prices?.find(
                        (p: TourPrice) => p.currency === "USD",
                      )?.priceChild || ""
                    }
                    onChange={(e) => {
                      const prices = formData.prices || [];
                      const usdIndex = prices.findIndex(
                        (p: TourPrice) => p.currency === "USD",
                      );
                      if (usdIndex >= 0) {
                        const updated = [...prices];
                        updated[usdIndex] = {
                          ...updated[usdIndex],
                          priceChild: Number(e.target.value),
                        };
                        updateField("prices", updated);
                      } else {
                        updateField("prices", [
                          ...prices,
                          {
                            currency: "USD",
                            priceAdult: 0,
                            priceChild: Number(e.target.value),
                          },
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
                  sortOrder: formData.timelineItems?.length || 0,
                };
                updateField("timelineItems", [
                  ...(formData.timelineItems || []),
                  newItem,
                ]);
              }}
              onUpdate={(index, item: TimelineItem) => {
                const updated = [
                  ...(formData.timelineItems || []),
                ] as TimelineItem[];
                updated[index] = item;
                updateField("timelineItems", updated);
              }}
              onDelete={(index) => {
                const filtered = (formData.timelineItems || []).filter(
                  (_: TimelineItem, i: number) => i !== index,
                ) as TimelineItem[];
                updateField("timelineItems", filtered);
              }}
              renderItem={(
                item: TimelineItem,
                index,
                isEditingItem,
                onUpdate,
              ) => (
                <div className={styles.timelineItem}>
                  <Input
                    label="Hora"
                    value={item.timeLabel || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, timeLabel: e.target.value })
                    }
                    disabled={!isEditingItem || !isEditing}
                    placeholder="Ej: 9:00 AM"
                  />
                  <Input
                    label="Título"
                    value={item.title || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, title: e.target.value })
                    }
                    disabled={!isEditingItem || !isEditing}
                  />
                  <Textarea
                    label="Descripción"
                    value={item.description || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, description: e.target.value })
                    }
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
                  sortOrder: formData.featuredInfos?.length || 0,
                };
                updateField("featuredInfos", [
                  ...(formData.featuredInfos || []),
                  newItem,
                ]);
              }}
              onUpdate={(index, item: FeaturedInfo) => {
                const updated = [
                  ...(formData.featuredInfos || []),
                ] as FeaturedInfo[];
                updated[index] = item;
                updateField("featuredInfos", updated);
              }}
              onDelete={(index) => {
                const filtered = (formData.featuredInfos || []).filter(
                  (_: FeaturedInfo, i: number) => i !== index,
                );
                updateField("featuredInfos", filtered);
              }}
              renderItem={(item, index, isEditingItem, onUpdate) => (
                <div className={styles.featuredInfoItem}>
                  <IconPicker
                    label="Icono"
                    value={item.icon || ""}
                    onChange={(iconName) =>
                      onUpdate({ ...item, icon: iconName })
                    }
                    disabled={!isEditingItem || !isEditing}
                    placeholder="Seleccionar icono"
                  />
                  <Input
                    label="Título"
                    value={item.title || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, title: e.target.value })
                    }
                    disabled={!isEditingItem || !isEditing}
                  />
                  <Textarea
                    label="Descripción"
                    value={item.description || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, description: e.target.value })
                    }
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
                  sortOrder: formData.testimonials?.length || 0,
                };
                updateField("testimonials", [
                  ...(formData.testimonials || []),
                  newItem,
                ]);
              }}
              onUpdate={(index, item: Testimonial) => {
                const updated = [
                  ...(formData.testimonials || []),
                ] as Testimonial[];
                updated[index] = item;
                updateField("testimonials", updated);
              }}
              onDelete={(index) => {
                const filtered = (formData.testimonials || []).filter(
                  (_: Testimonial, i: number) => i !== index,
                ) as Testimonial[];
                updateField("testimonials", filtered);
              }}
              renderItem={(
                item: Testimonial,
                index,
                isEditingItem,
                onUpdate,
              ) => (
                <div className={styles.testimonialItem}>
                  <Textarea
                    label="Texto del Testimonio"
                    value={item.text || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, text: e.target.value })
                    }
                    disabled={!isEditingItem || !isEditing}
                    rows={3}
                  />
                  <Input
                    label="Autor"
                    value={item.author || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, author: e.target.value })
                    }
                    disabled={!isEditingItem || !isEditing}
                  />
                  <Input
                    label="Avatar (URL)"
                    value={item.avatar || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, avatar: e.target.value })
                    }
                    disabled={!isEditingItem || !isEditing}
                    placeholder="URL de la imagen del avatar"
                  />
                  <Input
                    label="País"
                    value={item.country || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, country: e.target.value })
                    }
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
                  sortOrder: formData.quickInfoItems?.length || 0,
                };
                updateField("quickInfoItems", [
                  ...(formData.quickInfoItems || []),
                  newItem,
                ]);
              }}
              onUpdate={(index, item: QuickInfoItem) => {
                const updated = [
                  ...(formData.quickInfoItems || []),
                ] as QuickInfoItem[];
                updated[index] = item;
                updateField("quickInfoItems", updated);
              }}
              onDelete={(index) => {
                const filtered = (formData.quickInfoItems || []).filter(
                  (_: QuickInfoItem, i: number) => i !== index,
                );
                updateField("quickInfoItems", filtered);
              }}
              renderItem={(item, index, isEditingItem, onUpdate) => (
                <div className={styles.quickInfoItem}>
                  <IconPicker
                    label="Icono"
                    value={item.icon || ""}
                    onChange={(iconName) =>
                      onUpdate({ ...item, icon: iconName })
                    }
                    disabled={!isEditingItem || !isEditing}
                    placeholder="Seleccionar icono"
                  />
                  <Input
                    label="Label"
                    value={item.label || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, label: e.target.value })
                    }
                    disabled={!isEditingItem || !isEditing}
                    placeholder="Ej: Duración"
                  />
                  <Input
                    label="Valor"
                    value={item.value || ""}
                    onChange={(e) =>
                      onUpdate({ ...item, value: e.target.value })
                    }
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
          </div>
        )}

        {activeTab === "availability" && formData.id && (
          <AvailabilityManager
            tourId={formData.id}
            disabled={!isEditing}
            tourWeekdays={{
              mondayAvailable: formData.mondayAvailable ?? true,
              tuesdayAvailable: formData.tuesdayAvailable ?? true,
              wednesdayAvailable: formData.wednesdayAvailable ?? true,
              thursdayAvailable: formData.thursdayAvailable ?? true,
              fridayAvailable: formData.fridayAvailable ?? true,
              saturdayAvailable: formData.saturdayAvailable ?? true,
              sundayAvailable: formData.sundayAvailable ?? true,
            }}
          />
        )}

        {activeTab === "availability" && !formData.id && (
          <Card title="Disponibilidad">
            <p className={styles.noIdMessage}>
              Guarda el tour primero para poder gestionar la disponibilidad.
            </p>
          </Card>
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
