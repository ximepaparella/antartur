"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import type { UpdateTourDto } from "@/modules/admin/lib/types";
import type {
  TourFormData,
  TourAdditional,
} from "@/modules/tours/components/admin/TourForm/types";
import { Card } from "@/components/common/Card/Card";
import { Button } from "@/components/common/Button/Button";
import { TourForm } from "@/modules/tours/components/admin/TourForm";
import { TourPreview } from "@/modules/tours/components/admin/TourPreview";
import styles from "./page.module.scss";

interface TourFullData {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  category: string;
  difficulty: string;
  durationHours: number;
  featuredImage: string;
  heroImage: string;
  heroSubheadline: string | null;
  shortDescription: string;
  longDescription: string;
  restrictionText: string;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  alternativeText: string | null;
  alternativePrice: string | null;
  timelineImportantNote: string | null;
  minAge: number | null;
  minPassengers: number | null;
  allowsInfants: boolean;
  // Weekdays
  mondayAvailable: boolean;
  tuesdayAvailable: boolean;
  wednesdayAvailable: boolean;
  thursdayAvailable: boolean;
  fridayAvailable: boolean;
  saturdayAvailable: boolean;
  sundayAvailable: boolean;
  images?: Array<{
    id: string;
    imageType: string;
    url: string;
    altText: string;
    sortOrder: number;
  }>;
  timelineItems?: Array<{
    id: string;
    timeLabel: string;
    title: string;
    description: string;
    sortOrder: number;
  }>;
  featuredInfos?: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    sortOrder: number;
  }>;
  testimonials?: Array<{
    id: string;
    text: string;
    author: string;
    avatar: string;
    country: string;
    sortOrder: number;
  }>;
  quickInfoItems?: Array<{
    id: string;
    icon: string;
    label: string;
    value: string;
    sortOrder: number;
  }>;
  prices?: Array<{
    id: string;
    currency: string;
    priceAdult: number;
    priceChild: number;
  }>;
  restrictions?: Array<{
    id: string;
    text: string;
    sortOrder: number;
  }>;
  additionals?: Array<{
    id?: string;
    name: string;
    description?: string | null;
    isActive?: boolean;
    sortOrder?: number;
    prices?: Array<{
      currency: string;
      price: number;
    }>;
  }>;
}

export default function AdminTourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.id as string;

  const [tour, setTour] = useState<TourFullData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        const response = await adminApiClient.getTourById(tourId);
        if (response.success && response.data) {
          setTour(response.data as TourFullData);
        } else {
          setError("Failed to fetch tour");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    if (tourId && tourId !== "new") {
      fetchTour();
    } else {
      setIsEditing(true);
    }
  }, [tourId]);

  const handleSave = async (formData: TourFormData) => {
    if (!tour) return;

    try {
      // Transform additionals from the form format to the API format
      const transformedFormData = { ...formData };
      if (
        transformedFormData.additionals &&
        Array.isArray(transformedFormData.additionals)
      ) {
        transformedFormData.additionals = transformedFormData.additionals.map(
          (additional) => {
            // Convert prices from { ARS: { adult, child }, USD: { adult, child } }
            // to { currency, price }[] if needed
            if (
              additional.prices &&
              typeof additional.prices === "object" &&
              !Array.isArray(additional.prices)
            ) {
              const pricesRecord = additional.prices as Record<
                string,
                { adult: number; child: number } | undefined
              >;
              const pricesArray: Array<{ currency: string; price: number }> =
                [];

              if (pricesRecord.ARS) {
                // For now, use the adult price as the base price
                pricesArray.push({
                  currency: "ARS",
                  price: pricesRecord.ARS.adult,
                });
              }
              if (pricesRecord.USD) {
                pricesArray.push({
                  currency: "USD",
                  price: pricesRecord.USD.adult,
                });
              }

              return { ...additional, prices: pricesArray };
            }
            return additional;
          },
        ) as TourAdditional[];
      }

      // Limpiar el payload: eliminar campos que no deben enviarse
      const { id, ...cleanFormData } = transformedFormData;

      // Asegurar que los weekdays se incluyan explícitamente en el payload
      // Los weekdays siempre deben estar presentes en el payload
      const payload: UpdateTourDto = {
        ...cleanFormData,
        mondayAvailable:
          cleanFormData.mondayAvailable ?? tour.mondayAvailable ?? true,
        tuesdayAvailable:
          cleanFormData.tuesdayAvailable ?? tour.tuesdayAvailable ?? true,
        wednesdayAvailable:
          cleanFormData.wednesdayAvailable ?? tour.wednesdayAvailable ?? true,
        thursdayAvailable:
          cleanFormData.thursdayAvailable ?? tour.thursdayAvailable ?? true,
        fridayAvailable:
          cleanFormData.fridayAvailable ?? tour.fridayAvailable ?? true,
        saturdayAvailable:
          cleanFormData.saturdayAvailable ?? tour.saturdayAvailable ?? true,
        sundayAvailable:
          cleanFormData.sundayAvailable ?? tour.sundayAvailable ?? true,
      } as UpdateTourDto;

      // Eliminar arrays vacíos para evitar problemas de validación
      if (
        payload.images &&
        Array.isArray(payload.images) &&
        payload.images.length === 0
      ) {
        delete payload.images;
      }
      if (
        payload.timelineItems &&
        Array.isArray(payload.timelineItems) &&
        payload.timelineItems.length === 0
      ) {
        delete payload.timelineItems;
      }
      if (
        payload.featuredInfos &&
        Array.isArray(payload.featuredInfos) &&
        payload.featuredInfos.length === 0
      ) {
        delete payload.featuredInfos;
      }
      if (
        payload.testimonials &&
        Array.isArray(payload.testimonials) &&
        payload.testimonials.length === 0
      ) {
        delete payload.testimonials;
      }
      if (
        payload.quickInfoItems &&
        Array.isArray(payload.quickInfoItems) &&
        payload.quickInfoItems.length === 0
      ) {
        delete payload.quickInfoItems;
      }
      // Si las restricciones llegan como array vacío, enviarlas para borrar en backend
      if (
        payload.restrictions &&
        Array.isArray(payload.restrictions) &&
        payload.restrictions.length === 0
      ) {
        payload.restrictions = [];
      }
      if (
        payload.prices &&
        Array.isArray(payload.prices) &&
        payload.prices.length === 0
      ) {
        delete payload.prices;
      }

      const response = await adminApiClient.updateTour(tour.id, payload);
      if (response.success) {
        setIsEditing(false);
        setShowPreview(false);
        // Recargar datos completos para obtener los weekdays actualizados
        const refreshResponse = await adminApiClient.getTourById(tour.id);
        if (refreshResponse.success && refreshResponse.data) {
          setTour(refreshResponse.data as TourFullData);
        }
      } else {
        alert("Error al guardar: Unknown error");
      }
    } catch (err) {
      console.error("Error saving tour:", err);
      alert(
        "Error al guardar: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    }
  };

  const handleCancel = () => {
    if (tour) {
      setIsEditing(false);
      setShowPreview(false);
    } else {
      router.push("/admin/tours");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Cargando tour...</p>
      </div>
    );
  }

  if (error && !tour) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <Button variant="outline" onClick={() => router.push("/admin/tours")}>
          Volver a tours
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {tour && <h1 className={styles.tourTitle}>{tour.name}</h1>}

      <div className={styles.header}>
        <Button variant="outline" onClick={() => router.push("/admin/tours")}>
          ← Volver
        </Button>
        <div className={styles.actions}>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Ocultar Preview" : "Ver Preview"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              {/* Guardar button is handled by TourForm */}
            </>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {showPreview && tour ? (
          <TourPreview tourData={tour as TourFormData} />
        ) : tour ? (
          <TourForm
            tour={tour as TourFormData}
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : null}
      </div>
    </div>
  );
}
