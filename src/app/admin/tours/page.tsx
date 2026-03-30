"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDataTable } from "@/modules/admin/hooks/useDataTable";
import { adminApiClient } from "@/modules/admin/lib/adminApiClient";
import type { CreateTourDto } from "@/modules/admin/lib/types";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { Copy, Trash2 } from "lucide-react";
import { generateSlug } from "@/lib/utils/slug";
import type { TableColumn } from "@/components/common/Table/Table";
import type { FilterConfig } from "@/components/common/FiltersBar";
import styles from "./page.module.scss";

interface Tour {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  slug: string;
}

interface ConfirmAction {
  type: "delete" | "duplicate";
  tourId: string;
  tourName: string;
}

const getColumns = (
  onDuplicate: (tourId: string, tourName: string) => void,
  duplicatingId: string | null,
  onDelete: (tourId: string, tourName: string) => void,
  deletingId: string | null
): TableColumn<Tour>[] => [
  {
    key: "name",
    label: "Nombre",
  },
  {
    key: "category",
    label: "Categoría",
    render: (value) => (
      <span className={styles.category}>{value}</span>
    ),
  },
  {
    key: "isActive",
    label: "Estado",
    render: (value) => (
      <StatusBadge
        status={value ? ("ACTIVE" as any) : ("INACTIVE" as any)}
      />
    ),
  },
  {
    key: "slug",
    label: "Slug",
    render: (value) => <span className={styles.slug}>{value}</span>,
  },
  {
    key: "actions",
    label: "Acciones",
    align: "right",
    render: (_, row) => (
      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="small"
          onClick={() => onDuplicate(row.id, row.name)}
          disabled={duplicatingId === row.id || deletingId === row.id}
        >
          <Copy size={16} />
        </Button>
        <Button
          variant="danger"
          size="small"
          onClick={() => onDelete(row.id, row.name)}
          disabled={deletingId === row.id || duplicatingId === row.id}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    ),
  },
];

const filterConfigs: FilterConfig[] = [
  {
    key: "category",
    label: "Categoría",
    type: "select",
    options: [
      { value: "", label: "Todas" },
      { value: "summer", label: "Verano" },
      { value: "winter", label: "Invierno" },
    ],
  },
  {
    key: "isActive",
    label: "Estado",
    type: "select",
    options: [
      { value: "", label: "Todos" },
      { value: "true", label: "Activo" },
      { value: "false", label: "Inactivo" },
    ],
  },
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Nombre del tour...",
  },
];

export default function AdminToursPage() {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchTours = useCallback(async ({ page, limit, filters }: {
    page: number;
    limit: number;
    filters?: Record<string, string>;
  }) => {
    const response = await adminApiClient.getTours({
      page,
      limit,
      category: filters?.category || undefined,
      isActive:
        filters?.isActive && filters.isActive !== ""
          ? filters.isActive === "true"
          : undefined,
    });

    // Simple search filtering
    let filteredData = response.data || [];
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter((tour) =>
        tour.name.toLowerCase().includes(searchLower)
      );
    }

    return {
      ...response,
      data: filteredData,
    };
  }, []);

  const {
    data,
    isLoading,
    error,
    page,
    limit,
    filters,
    meta,
    handlePageChange,
    handleLimitChange,
    handleFilterChange,
    clearFilters,
    refetch,
  } = useDataTable<Tour>({
    fetchData: fetchTours,
    initialPage: 1,
    initialLimit: 25,
  });

  const handleRowClick = (tour: Tour) => {
    router.push(`/admin/tours/${tour.id}`);
  };

  const executeDelete = useCallback(async (tourId: string) => {
    try {
      setDeletingId(tourId);
      const response = await adminApiClient.deleteTour(tourId);
      if (response.success) {
        refetch();
      } else {
        setFeedbackMessage("No se pudo eliminar el tour.");
      }
    } catch (err) {
      setFeedbackMessage(`Error al eliminar: ${err instanceof Error ? err.message : "Error desconocido"}`);
    } finally {
      setDeletingId(null);
    }
  }, [refetch]);

  const handleDelete = useCallback(async (tourId: string, tourName: string) => {
    setConfirmAction({
      type: "delete",
      tourId,
      tourName,
    });
  }, []);

  const executeDuplicate = useCallback(async (tourId: string) => {
    try {
      setDuplicatingId(tourId);
      const sourceResponse = await adminApiClient.getTourById(tourId);
      if (!sourceResponse.success || !sourceResponse.data) {
        throw new Error("No se pudo cargar el tour a duplicar");
      }

      const source = sourceResponse.data as any;
      const clonedName = `${source.name} (Copia)`;
      const clonedSlug = generateSlug(clonedName) || `${source.slug}-copia`;

      const payload: CreateTourDto = {
        name: clonedName,
        slug: clonedSlug,
        subtitle: source.subtitle || null,
        category: source.category,
        difficulty: source.difficulty,
        durationHours: source.durationHours,
        featuredImage: source.featuredImage,
        heroImage: source.heroImage,
        heroSubheadline: source.heroSubheadline || null,
        shortDescription: source.shortDescription,
        longDescription: source.longDescription,
        restrictionText: source.restrictionText || "",
        isActive: source.isActive,
        metaTitle: source.metaTitle || null,
        metaDescription: source.metaDescription || null,
        canonicalUrl: null,
        ogImage: source.ogImage || source.heroImage || null,
        ctaLabel: source.ctaLabel || "RESERVAR",
        ctaHref: source.ctaHref || "",
        alternativeText: source.alternativeText || "Consultar precio",
        alternativePrice: source.alternativePrice || "Consultar",
        timelineImportantNote: source.timelineImportantNote || null,
        minAge: source.minAge ?? null,
        minPassengers: source.minPassengers ?? null,
        mondayAvailable: source.mondayAvailable ?? true,
        tuesdayAvailable: source.tuesdayAvailable ?? true,
        wednesdayAvailable: source.wednesdayAvailable ?? true,
        thursdayAvailable: source.thursdayAvailable ?? true,
        fridayAvailable: source.fridayAvailable ?? true,
        saturdayAvailable: source.saturdayAvailable ?? true,
        sundayAvailable: source.sundayAvailable ?? true,
        defaultStartTime: source.defaultStartTime ?? null,
        defaultEndTime: source.defaultEndTime ?? null,
        images: (source.images || []).map((img: any) => ({
          imageType: img.imageType,
          url: img.url,
          altText: img.altText,
          sortOrder: img.sortOrder,
        })),
        prices: (source.prices || []).map((price: any) => ({
          currency: price.currency,
          priceAdult: Number(price.priceAdult),
          priceChild: Number(price.priceChild),
        })),
        quickInfoItems: (source.quickInfoItems || []).map((item: any) => ({
          icon: item.icon,
          label: item.label || "",
          value: item.value,
        })),
        timelineItems: (source.timelineItems || []).map((item: any) => ({
          timeLabel: item.timeLabel,
          title: item.title,
          description: item.description,
        })),
        featuredInfos: (source.featuredInfos || []).map((item: any) => ({
          icon: item.icon,
          title: item.title,
          description: item.description,
        })),
        testimonials: (source.testimonials || []).map((item: any) => ({
          text: item.text,
          author: item.author,
          avatar: item.avatar,
          country: item.country,
        })),
        restrictions: (source.restrictions || []).map((item: any) => ({
          text: item.text,
          sortOrder: item.sortOrder,
        })),
        additionals: (source.additionals || []).map((additional: any) => ({
          name: additional.name,
          description: additional.description || null,
          isActive: additional.isActive ?? true,
          sortOrder: additional.sortOrder ?? 0,
          prices: (additional.prices || []).map((price: any) => ({
            currency: price.currency,
            price: Number(price.priceAdult),
          })),
        })),
      };

      const createResponse = await adminApiClient.createTour(payload);
      if (!createResponse.success || !createResponse.data) {
        throw new Error("No se pudo crear la copia del tour");
      }

      router.push(`/admin/tours/${createResponse.data.id}`);
    } catch (err) {
      setFeedbackMessage(`Error al duplicar: ${err instanceof Error ? err.message : "Error desconocido"}`);
    } finally {
      setDuplicatingId(null);
    }
  }, [router]);

  const handleDuplicate = useCallback(async (tourId: string, tourName: string) => {
    setConfirmAction({
      type: "duplicate",
      tourId,
      tourName,
    });
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const action = confirmAction;
    setConfirmAction(null);

    if (action.type === "delete") {
      await executeDelete(action.tourId);
      return;
    }
    await executeDuplicate(action.tourId);
  };

  const columns = getColumns(handleDuplicate, duplicatingId, handleDelete, deletingId);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tours</h1>
          <p className={styles.subtitle}>Gestiona todos los tours del sistema</p>
        </div>
        <Button variant="primary" onClick={() => router.push("/admin/tours/new")}>
          Nuevo Tour
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={meta?.totalPages || 1}
        onPageChange={handlePageChange}
        pageSize={limit}
        onPageSizeChange={handleLimitChange}
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onRowClick={handleRowClick}
        emptyMessage="No hay tours disponibles"
      />

      <Modal
        isOpen={!!confirmAction}
        title={confirmAction?.type === "delete" ? "Eliminar tour" : "Duplicar tour"}
        onClose={() => setConfirmAction(null)}
        size="medium"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalMessage}>
            {confirmAction?.type === "delete"
              ? `¿Estás seguro de eliminar el tour "${confirmAction?.tourName}"? Esta acción no se puede deshacer.`
              : `Se va a duplicar el tour "${confirmAction?.tourName}". Se creará una copia completa para que puedas ajustar la temporada.`}
          </p>
          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancelar
            </Button>
            <Button
              variant={confirmAction?.type === "delete" ? "danger" : "primary"}
              onClick={() => void handleConfirmAction()}
              disabled={!!deletingId || !!duplicatingId}
            >
              {confirmAction?.type === "delete" ? "Eliminar" : "Duplicar"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!feedbackMessage}
        title="Aviso"
        onClose={() => setFeedbackMessage(null)}
        size="small"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalMessage}>{feedbackMessage}</p>
          <div className={styles.modalActions}>
            <Button variant="primary" onClick={() => setFeedbackMessage(null)}>
              Entendido
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

