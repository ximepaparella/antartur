"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
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
          setError(response.error || "Failed to fetch tour");
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

  const handleSave = async (formData: Partial<TourFullData>) => {
    if (!tour) return;

    try {
      const response = await adminApiClient.updateTour(tour.id, formData);
      if (response.success) {
        setIsEditing(false);
        setShowPreview(false);
        if (response.data) {
          setTour(response.data as TourFullData);
        }
        // Recargar datos completos
        const refreshResponse = await adminApiClient.getTourById(tour.id);
        if (refreshResponse.success && refreshResponse.data) {
          setTour(refreshResponse.data as TourFullData);
        }
      }
    } catch (err) {
      alert("Error al guardar: " + (err instanceof Error ? err.message : "Unknown error"));
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
      <div className={styles.header}>
        <Button variant="outline" onClick={() => router.push("/admin/tours")}>
          ← Volver
        </Button>
        <div className={styles.actions}>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
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
          <TourPreview tourData={tour} />
        ) : tour ? (
          <TourForm
            tour={tour}
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : null}
      </div>
    </div>
  );
}
