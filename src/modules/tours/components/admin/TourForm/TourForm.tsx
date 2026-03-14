"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card/Card";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { Textarea } from "@/components/common/Textarea/Textarea";
import { Select } from "@/components/common/Select/Select";
import { ArrayFieldManager } from "@/components/common/ArrayFieldManager";
import { ImagePicker } from "@/modules/tours/components/admin/ImagePicker";
import { AvatarPicker } from "@/modules/tours/components/admin/AvatarPicker/AvatarPicker";
import { IconPicker } from "@/modules/tours/components/admin/IconPicker";
import { GalleryManager } from "@/modules/tours/components/admin/GalleryManager";
import { AvailabilityManager } from "../AvailabilityManager";
import type { TourFormProps, TabType } from "@/modules/tours/types/admin";
import type { TourFormData, TourImage, QuickInfoItem, TimelineItem, FeaturedInfo, Testimonial, TourPrice, Restriction, TourAdditional } from "./types";
import {
  sanitizeImages,
  filterQuickInfoItems,
  filterTimelineItems,
  filterFeaturedInfos,
  validateTestimonials,
  filterTestimonials,
  removeEmptyArrays,
} from "./helpers/tourFormValidation";
import { generateSlug } from "@/lib/utils/slug";
import styles from "./TourForm.module.scss";

export function TourForm({ tour, isEditing, onSave, onCancel }: TourFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [formData, setFormData] = useState<TourFormData>({});

  useEffect(() => {
    if (tour) {
      // Transformar additionals del formato API al formato del formulario
      // Mapear prices al formato de objeto con ARS/USD keys
      const transformedAdditionals = tour.additionals?.map((add: any) => {
        const pricesObj: { ARS?: { adult: number; child: number }; USD?: { adult: number; child: number } } = {};
        
        if (add.prices && Array.isArray(add.prices)) {
          add.prices.forEach((p: any) => {
            const priceValue = Number(p.priceAdult || p.price || 0);
            if (p.currency === "ARS") {
              pricesObj.ARS = { adult: priceValue, child: priceValue };
            } else if (p.currency === "USD") {
              pricesObj.USD = { adult: priceValue, child: priceValue };
            }
          });
        }
        
        return {
          id: add.id,
          name: add.name,
          description: add.description,
          isActive: add.isActive ?? true,
          sortOrder: add.sortOrder ?? 0,
          prices: Object.keys(pricesObj).length > 0 ? pricesObj : undefined,
        };
      }) || [];

      // Asegurar que los weekdays tengan valores explícitos al inicializar
      // Los weekdays ahora vienen del backend, pero usamos defaults si no están presentes
      setFormData({
        ...tour,
        mondayAvailable: tour.mondayAvailable ?? true,
        tuesdayAvailable: tour.tuesdayAvailable ?? true,
        wednesdayAvailable: tour.wednesdayAvailable ?? true,
        thursdayAvailable: tour.thursdayAvailable ?? true,
        fridayAvailable: tour.fridayAvailable ?? true,
        saturdayAvailable: tour.saturdayAvailable ?? true,
        sundayAvailable: tour.sundayAvailable ?? true,
        defaultStartTime: tour.defaultStartTime ?? null,
        defaultEndTime: tour.defaultEndTime ?? null,
        allowsInfants: tour.allowsInfants ?? false,
        additionals: transformedAdditionals,
        // Valores por defecto para campos no configurables
        timelineImportantNote: tour.timelineImportantNote || "Itinerario a modo informativo, puede variar de acuerdo a las condiciones climáticas y al grupo.",
        alternativeText: tour.alternativeText || "Consultar precio",
        alternativePrice: tour.alternativePrice || "Consultar",
        ctaLabel: tour.ctaLabel || "RESERVAR",
        ctaHref: tour.ctaHref || "",
        // OG Image usa heroImage por default
        ogImage: tour.ogImage || tour.heroImage || "",
      });
    }
  }, [tour]);

  // Auto-generar slug cuando cambie el nombre (solo para tours nuevos o si el slug está vacío)
  useEffect(() => {
    if (formData.name && (!formData.slug || !tour?.id)) {
      const newSlug = generateSlug(formData.name);
      if (newSlug && newSlug !== formData.slug) {
        setFormData((prev) => ({ ...prev, slug: newSlug }));
      }
    }
  }, [formData.name, formData.slug, tour?.id]);

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "basic", label: "Información Básica" },
    { id: "images", label: "Imágenes" },
    { id: "content", label: "Contenido" },
    { id: "availability", label: "Disponibilidad" },
    { id: "grid", label: "Tour Grid" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtrar items vacíos de las relaciones antes de guardar
    const cleanedFormData = { ...formData };
    
    // Asegurar que las imágenes featured y hero estén en el array images
    const images: any[] = cleanedFormData.images || [];
    const hasFeatured = images.some((img: any) => img.imageType === "FEATURED");
    const hasHero = images.some((img: any) => img.imageType === "HERO");
    
    if (cleanedFormData.featuredImage && !hasFeatured) {
      images.push({
        imageType: "FEATURED",
        url: cleanedFormData.featuredImage,
        altText: cleanedFormData.name || "Featured image",
        sortOrder: 0,
      });
    }
    
    if (cleanedFormData.heroImage && !hasHero) {
      images.push({
        imageType: "HERO",
        url: cleanedFormData.heroImage,
        altText: cleanedFormData.name || "Hero image",
        sortOrder: 1,
      });
    }
    
    // Filtrar images con campos vacíos (permitir altText vacío si hay URL válida)
    cleanedFormData.images = images.filter(
      (item) => item.imageType && item.url
    ).map((item) => ({
      ...item,
      altText: item.altText || item.url.split('/').pop() || 'Imagen', // Asegurar altText
    }));
    
    // Filtrar quickInfoItems con campos vacíos
    if (cleanedFormData.quickInfoItems) {
      cleanedFormData.quickInfoItems = cleanedFormData.quickInfoItems.filter(
        (item: QuickInfoItem) => item.icon && item.label && item.value
      );
    }
    
    // Filtrar timelineItems con campos vacíos
    if (cleanedFormData.timelineItems) {
      cleanedFormData.timelineItems = cleanedFormData.timelineItems.filter(
        (item: TimelineItem) => item.timeLabel && item.title && item.description
      );
    }
    
    // Filtrar featuredInfos con campos vacíos
    if (cleanedFormData.featuredInfos) {
      cleanedFormData.featuredInfos = cleanedFormData.featuredInfos.filter(
        (item: FeaturedInfo) => item.icon && item.title && item.description
      );
    }
    
    // Filtrar testimonials con campos vacíos - solo incluir si TODOS los campos requeridos están completos
    if (cleanedFormData.testimonials) {
      const invalidTestimonials: number[] = [];
      cleanedFormData.testimonials.forEach((item: Testimonial, index: number) => {
        // Validar que todos los campos requeridos estén completos
        const isValid = (
          item.text && 
          item.text.trim() && 
          item.author && 
          item.author.trim() &&
          item.avatar &&
          item.avatar.trim() &&
          item.country &&
          item.country.trim()
        );
        if (!isValid) {
          invalidTestimonials.push(index + 1);
        }
      });

      if (invalidTestimonials.length > 0) {
        alert(
          `Los siguientes testimonials no se guardarán porque faltan campos requeridos (texto, autor, avatar o país): ${invalidTestimonials.join(", ")}. ` +
          `Recuerda que el avatar es obligatorio.`
        );
      }

      cleanedFormData.testimonials = cleanedFormData.testimonials.filter(
        (item: Testimonial) => {
          // Todos los campos requeridos deben tener valores no vacíos
          return (
            item.text && 
            item.text.trim() && 
            item.author && 
            item.author.trim() &&
            item.avatar &&
            item.avatar.trim() &&
            item.country &&
            item.country.trim()
          );
        }
      );
    }

    // Filtrar restrictions con campos vacíos
    if (cleanedFormData.restrictions) {
      cleanedFormData.restrictions = cleanedFormData.restrictions.filter(
        (item: Restriction) => item.text && item.text.trim()
      );
    }

    // Filtrar additionals con campos vacíos (solo nombre es requerido)
    // Transformar prices del formato objeto al formato array esperado por el backend
    if (cleanedFormData.additionals) {
      cleanedFormData.additionals = cleanedFormData.additionals
        .filter((item: TourAdditional) => item.name && item.name.trim())
        .map((item: TourAdditional) => {
          // Transformar prices de objeto { ARS?: { adult, child }, USD?: { adult, child } } 
          // a array [{ currency, price }] donde price es el valor general (adult = child)
          const pricesArray: Array<{ currency: string; price: number }> = [];
          
          if (item.prices) {
            if (item.prices.ARS && typeof item.prices.ARS.adult === 'number' && !isNaN(item.prices.ARS.adult) && item.prices.ARS.adult >= 0) {
              pricesArray.push({ currency: "ARS", price: item.prices.ARS.adult });
            }
            if (item.prices.USD && typeof item.prices.USD.adult === 'number' && !isNaN(item.prices.USD.adult) && item.prices.USD.adult >= 0) {
              pricesArray.push({ currency: "USD", price: item.prices.USD.adult });
            }
          }
          
          return {
            ...item,
            prices: pricesArray,
          } as any; // Type assertion necesario porque transformamos el formato
        }) as any;
    }
    
    // Eliminar campos que no deben enviarse en el update
    const { id, departures, createdAt, updatedAt, ...dataToSave } = cleanedFormData;
    
    // Asegurar valores por defecto para campos no configurables
    dataToSave.timelineImportantNote = dataToSave.timelineImportantNote || "Itinerario a modo informativo, puede variar de acuerdo a las condiciones climáticas y al grupo.";
    dataToSave.alternativeText = dataToSave.alternativeText || "Consultar precio";
    dataToSave.alternativePrice = dataToSave.alternativePrice || "Consultar";
    dataToSave.ctaLabel = dataToSave.ctaLabel || "RESERVAR";
    dataToSave.ctaHref = dataToSave.ctaHref || "";
    // OG Image usa heroImage por default
    if (!dataToSave.ogImage && formData.heroImage) {
      dataToSave.ogImage = formData.heroImage;
    }
    
    // Asegurar que los arrays solo se envíen si tienen elementos válidos
    if (dataToSave.images && dataToSave.images.length === 0) {
      delete dataToSave.images;
    }
    if (dataToSave.timelineItems && dataToSave.timelineItems.length === 0) {
      delete dataToSave.timelineItems;
    }
    if (dataToSave.featuredInfos && dataToSave.featuredInfos.length === 0) {
      delete dataToSave.featuredInfos;
    }
    if (dataToSave.additionals && dataToSave.additionals.length === 0) {
      delete dataToSave.additionals;
    }
    if (dataToSave.testimonials && dataToSave.testimonials.length === 0) {
      delete dataToSave.testimonials;
    }
    if (dataToSave.quickInfoItems && dataToSave.quickInfoItems.length === 0) {
      delete dataToSave.quickInfoItems;
    }
    // Si el array de restricciones queda vacío, enviarlo como [] para que el backend elimine las existentes
    if (dataToSave.restrictions && dataToSave.restrictions.length === 0) {
      dataToSave.restrictions = [];
    }
    if (dataToSave.prices && dataToSave.prices.length === 0) {
      delete dataToSave.prices;
    }
    // Si el array de additionals queda vacío, enviarlo como [] para que el backend elimine las existentes
    if (dataToSave.additionals && dataToSave.additionals.length === 0) {
      dataToSave.additionals = [];
    }
    
    onSave(dataToSave);
  };

  const updateField = <K extends keyof TourFormData>(field: K, value: TourFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper para obtener imágenes de galería
  const getGalleryImages = (): any[] => {
    return (formData.images || [])
      .filter((img) => img.imageType === "GALLERY")
      .map((img, index) => ({
        ...img,
        id: img.id || `gallery-${index}-${Date.now()}`,
        sortOrder: index,
      }));
  };

  // Helper para actualizar imágenes de galería
  const updateGalleryImages = (galleryImages: TourImage[]) => {
    const otherImages = (formData.images || []).filter((img) => img.imageType !== "GALLERY");
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
                label="Slug"
                value={formData.slug || ""}
                onChange={(e) => updateField("slug", e.target.value)}
                disabled={true}
                required
                placeholder="Se genera automáticamente desde el nombre"
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
                    checked={formData.allowsInfants || false}
                    onChange={(e) => updateField("allowsInfants", e.target.checked)}
                    disabled={!isEditing}
                  />
                  <span>Acepta infantes (0-3 años, sin costo)</span>
                </label>
              </div>
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
                            updateField("category", newCategories.join(","));
                          }}
                          disabled={!isEditing}
                        />
                        <span>{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.restrictionsSection}>
              <h4 className={styles.sectionTitle}>Restricciones</h4>
              <p className={styles.sectionDescription}>
                Agrega las restricciones que se mostrarán en el tour.
              </p>
              <ArrayFieldManager
                title=""
                items={formData.restrictions || []}
                onAdd={() => {
                  const newItem: Restriction = {
                    id: `temp-${Date.now()}`,
                    text: "",
                    sortOrder: (formData.restrictions?.length || 0),
                  };
                  updateField("restrictions", [...(formData.restrictions || []), newItem]);
                }}
                onUpdate={(index, item) => {
                  const updated = [...(formData.restrictions || [])];
                  updated[index] = item;
                  updateField("restrictions", updated);
                }}
                onDelete={(index) => {
                  const filtered = (formData.restrictions || []).filter((_, i: number) => i !== index);
                  updateField("restrictions", filtered);
                }}
                renderItem={(item, index, isEditingItem, onUpdate) => (
                  <div className={styles.restrictionItem}>
                    <Textarea
                      label={`Restricción ${index + 1} *`}
                      value={item.text || ""}
                      onChange={(e) => onUpdate({ ...item, text: e.target.value })}
                      disabled={!isEditingItem || !isEditing}
                      rows={2}
                required
                      placeholder="Ej: Edad mínima 12 años"
              />
                  </div>
                )}
                getDefaultItem={() => ({
                  id: `temp-${Date.now()}`,
                  text: "",
                  sortOrder: formData.restrictions?.length || 0,
                })}
                disabled={!isEditing}
              />
            </div>
            
            <div className={styles.weekdaysCard}>
              <Card title="Días de Semana Disponibles">
                <p className={styles.weekdaysDescription}>
                  Selecciona los días de la semana en que este tour está disponible.
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
                          checked={(formData as any)[day.key] ?? true}
                          onChange={(e) => updateField(day.key as keyof TourFormData, e.target.checked as any)}
                          disabled={!isEditing}
                        />
                        <span>{day.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className={styles.defaultScheduleCard}>
              <Card title="Horario por defecto">
                <p className={styles.weekdaysDescription}>
                  Hora de inicio y fin que se usará al crear nuevas salidas en el calendario de disponibilidad. Cada salida puede editarse después para override.
                </p>
                <div className={styles.defaultScheduleRow}>
                  <Input
                    label="Hora de inicio"
                    type="time"
                    value={formData.defaultStartTime ?? ""}
                    onChange={(e) => updateField("defaultStartTime", e.target.value || null)}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Hora de fin (opcional)"
                    type="time"
                    value={formData.defaultEndTime ?? ""}
                    onChange={(e) => updateField("defaultEndTime", e.target.value || null)}
                    disabled={!isEditing}
                  />
                </div>
              </Card>
            </div>

            <div className={styles.priceSection}>
          <Card title="Precios">
            <div className={styles.formGrid}>
              <div className={styles.priceSection}>
                <h4 className={styles.sectionTitle}>Precio ARS</h4>
                <div className={styles.priceRow}>
                  <Input
                    label="Precio Adulto (ARS)"
                    type="number"
                    value={
                      formData.prices?.find((p: TourPrice) => p.currency === "ARS")?.priceAdult || ""
                    }
                    onChange={(e) => {
                      const prices = formData.prices || [];
                      const arsIndex = prices.findIndex((p: TourPrice) => p.currency === "ARS");
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
                      const arsIndex = prices.findIndex((p: TourPrice) => p.currency === "ARS");
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
                      formData.prices?.find((p: TourPrice) => p.currency === "USD")?.priceAdult || ""
                    }
                    onChange={(e) => {
                      const prices = formData.prices || [];
                      const usdIndex = prices.findIndex((p: TourPrice) => p.currency === "USD");
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
                      const usdIndex = prices.findIndex((p: TourPrice) => p.currency === "USD");
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
            </div>

            <div className={styles.additionalsSection}>
              <Card title="Opciones Adicionales">
                <p className={styles.sectionDescription}>
                  Agrega opciones adicionales que los usuarios pueden seleccionar al hacer una reserva (ej: &quot;Con Canoas&quot;).
                </p>
                <ArrayFieldManager
                  title=""
                  items={formData.additionals || []}
                  onAdd={() => {
                    const newItem: TourAdditional = {
                      id: `temp-${Date.now()}`,
                      name: "",
                      description: null,
                      isActive: true,
                      sortOrder: (formData.additionals?.length || 0),
                      prices: {
                        ARS: { adult: 0, child: 0 },
                        USD: { adult: 0, child: 0 },
                      },
                    };
                    updateField("additionals", [...(formData.additionals || []), newItem]);
                  }}
                  onUpdate={(index, item) => {
                    const updated = [...(formData.additionals || [])];
                    updated[index] = item;
                    updateField("additionals", updated);
                  }}
                  onDelete={(index) => {
                    const filtered = (formData.additionals || []).filter((_, i: number) => i !== index);
                    updateField("additionals", filtered);
                  }}
                  renderItem={(item, index, isEditingItem, onUpdate) => (
                    <div className={styles.additionalItem}>
                      <Input
                        label={`Nombre del adicional ${index + 1} *`}
                        value={item.name || ""}
                        onChange={(e) => onUpdate({ ...item, name: e.target.value })}
                        disabled={!isEditingItem || !isEditing}
                        required
                        placeholder="Ej: Con Canoas"
                      />
                      <Textarea
                        label="Descripción (opcional)"
                        value={item.description || ""}
                        onChange={(e) => onUpdate({ ...item, description: e.target.value || null })}
                        disabled={!isEditingItem || !isEditing}
                        rows={2}
                        placeholder="Descripción del adicional"
                      />
                      <div className={styles.priceSection}>
                        <div className={styles.formGrid}>
                          <div className={styles.priceSection}>
                            <h4 className={styles.sectionTitle}>Precio ARS</h4>
                            <Input
                              label="Precio (ARS)"
                              type="number"
                              value={
                                item.prices?.ARS?.adult || ""
                              }
                              onChange={(e) => {
                                const prices = item.prices || {};
                                const priceValue = e.target.value === "" ? 0 : Number(e.target.value);
                                if (isNaN(priceValue)) return; // No actualizar si es NaN
                                onUpdate({
                                  ...item,
                                  prices: {
                                    ...prices,
                                    ARS: { adult: priceValue, child: priceValue },
                                  },
                                });
                              }}
                              disabled={!isEditingItem || !isEditing}
                              placeholder="0"
                            />
                          </div>

                          <div className={styles.priceSection}>
                            <h4 className={styles.sectionTitle}>Precio USD</h4>
                            <Input
                              label="Precio (USD)"
                              type="number"
                              value={
                                item.prices?.USD?.adult || ""
                              }
                              onChange={(e) => {
                                const prices = item.prices || {};
                                const priceValue = e.target.value === "" ? 0 : Number(e.target.value);
                                if (isNaN(priceValue)) return; // No actualizar si es NaN
                                onUpdate({
                                  ...item,
                                  prices: {
                                    ...prices,
                                    USD: { adult: priceValue, child: priceValue },
                                  },
                                });
                              }}
                              disabled={!isEditingItem || !isEditing}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  getDefaultItem={() => ({
                    id: `temp-${Date.now()}`,
                    name: "",
                    description: null,
                    isActive: true,
                    sortOrder: formData.additionals?.length || 0,
                    prices: {
                      ARS: { adult: 0, child: 0 },
                      USD: { adult: 0, child: 0 },
                    },
                  })}
                  disabled={!isEditing}
                />
              </Card>
            </div>
          </Card>
        )}

        {activeTab === "grid" && (
          <Card title="Tour Grid">
            <p className={styles.sectionDescription}>
              Estos campos afectan cómo se ve el tour en el grid/listado de tours.
            </p>
            <div className={styles.formGrid}>
                <ImagePicker
                label="Imagen Featured (Card)"
                  value={formData.featuredImage || ""}
                  onChange={(url) => updateField("featuredImage", url)}
                tourSlug={formData.slug || generateSlug(formData.name || "") || "default"}
                  imageType="featured"
                  disabled={!isEditing}
                />
              <Input
                label="Nombre (Título)"
                value={formData.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={!isEditing}
                required
                placeholder="Título que aparece en la card del grid"
              />
              <Input
                label="Subtítulo"
                value={formData.subtitle || ""}
                onChange={(e) => updateField("subtitle", e.target.value)}
                disabled={!isEditing}
                placeholder="Subtítulo que aparece en hover de la card"
              />
              <Select
                label="Dificultad"
                value={formData.difficulty || ""}
                onChange={(e) => updateField("difficulty", e.target.value)}
                disabled={!isEditing}
                options={[
                  { value: "", label: "Seleccionar..." },
                  { value: "bajo", label: "Bajo" },
                  { value: "medio", label: "Medio" },
                  { value: "dificil", label: "Difícil" },
                ]}
                required
              />
            </div>
          </Card>
        )}

        {activeTab === "images" && (
          <div className={styles.imagesTab}>
            <Card title="Imágenes Principales">
              <div className={styles.imagePickersGrid}>
                <ImagePicker
                  label="Imagen Hero"
                  value={formData.heroImage || ""}
                  onChange={(url) => updateField("heroImage", url)}
                  tourSlug={formData.slug || generateSlug(formData.name || "") || "default"}
                  imageType="hero"
                  disabled={!isEditing}
                />
              </div>
              <div className={styles.formGrid}>
                <Input
                  label="Subheadline del Hero"
                  value={formData.heroSubheadline || ""}
                  onChange={(e) => updateField("heroSubheadline", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Texto que aparece sobre el hero"
                />
              </div>
            </Card>

            <GalleryManager
              images={getGalleryImages()}
              onChange={updateGalleryImages}
              tourSlug={formData.slug || generateSlug(formData.name || "") || "default"}
              disabled={!isEditing}
            />
          </div>
        )}

        {activeTab === "content" && (
          <Card title="Contenido">
            <div className={styles.singleColumnLayout}>
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
            </div>

            <div className={styles.singleColumnLayout}>
            <section className={styles.relationSection}>
                <h3 className={styles.relationSectionTitle}>Información Destacada</h3>
              <ArrayFieldManager
                title=""
                items={(formData.quickInfoItems as any) || []}
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
                  const filtered = (formData.quickInfoItems || []).filter((_, i: number) => i !== index);
                  updateField("quickInfoItems", filtered);
                }}
                renderItem={(item, index, isEditingItem, onUpdate) => (
                  <div className={styles.quickInfoItem}>
                    <IconPicker
                      label="Icono"
                      value={item.icon || ""}
                      onChange={(iconName) => onUpdate({ ...item, icon: iconName })}
                      disabled={!isEditingItem || !isEditing}
                      placeholder="Seleccionar icono"
                    />
                    <Input
                      label="Texto"
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
            </section>

            <section className={styles.relationSection}>
                <h3 className={styles.relationSectionTitle}>Información relevante</h3>
              <ArrayFieldManager
                title=""
                items={(formData.featuredInfos as any) || []}
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
                  const filtered = (formData.featuredInfos || []).filter((_, i: number) => i !== index);
                  updateField("featuredInfos", filtered);
                }}
                renderItem={(item, index, isEditingItem, onUpdate) => (
                  <div className={styles.featuredInfoItem}>
                    <IconPicker
                      label="Icono"
                      value={item.icon || ""}
                      onChange={(iconName) => onUpdate({ ...item, icon: iconName })}
                      disabled={!isEditingItem || !isEditing}
                      placeholder="Seleccionar icono"
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
            </section>

            <section className={styles.relationSection}>
                <h3 className={styles.relationSectionTitle}>Itinerario</h3>
              <ArrayFieldManager
                title=""
                items={(formData.timelineItems as any) || []}
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
                  const filtered = (formData.timelineItems || []).filter((_, i: number) => i !== index);
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
              </section>

              <section className={styles.relationSection}>
                <h3 className={styles.relationSectionTitle}>Testimonios</h3>
              <ArrayFieldManager
                title=""
                items={(formData.testimonials as any) || []}
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
                  const filtered = (formData.testimonials || []).filter((_, i: number) => i !== index);
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
                      required
                    />
                    <Input
                      label="Autor"
                      value={item.author || ""}
                      onChange={(e) => onUpdate({ ...item, author: e.target.value })}
                      disabled={!isEditingItem || !isEditing}
                      required
                    />
                    <AvatarPicker
                      label="Avatar"
                      value={item.avatar || ""}
                      onChange={(url) => onUpdate({ ...item, avatar: url })}
                      disabled={!isEditingItem || !isEditing}
                      placeholder="Sube una imagen o ingresa una URL"
                    />
                    <Input
                      label="País"
                      value={item.country || ""}
                      onChange={(e) => onUpdate({ ...item, country: e.target.value })}
                      disabled={!isEditingItem || !isEditing}
                      required
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
            </section>

            <section className={styles.relationSection}>
                <h3 className={styles.relationSectionTitle}>SEO</h3>
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
            </section>
          </div>
          </Card>
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
            defaultStartTime={formData.defaultStartTime ?? null}
            defaultEndTime={formData.defaultEndTime ?? null}
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
