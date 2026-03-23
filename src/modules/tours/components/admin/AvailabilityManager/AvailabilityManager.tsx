"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Save, X, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import { Modal } from "@/components/common/Modal/Modal";
import { DayCell } from "./DayCell";
import { BulkActions } from "./BulkActions";
import { createAuthHeaders } from "@/modules/admin/lib/authHelpers";
import { formatArDate } from "@/lib/utils/dateTimeAr";
import styles from "./AvailabilityManager.module.scss";

import type { AvailabilityManagerProps, Departure } from "@/modules/tours/types/admin";

const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface PendingBulkOverwrite {
  action: string;
  params: Record<string, any>;
  dates: Date[];
  existingCount: number;
  departuresByDate: Record<string, Departure>;
}

export function AvailabilityManager({ tourId, disabled = false, tourWeekdays }: AvailabilityManagerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekdays, setWeekdays] = useState(tourWeekdays || {
    mondayAvailable: true,
    tuesdayAvailable: true,
    wednesdayAvailable: true,
    thursdayAvailable: true,
    fridayAvailable: true,
    saturdayAvailable: true,
    sundayAvailable: true,
  });
  const [loadError, setLoadError] = useState<string | null>(null);

  // Cargar días disponibles del tour si no se pasaron como prop
  useEffect(() => {
    if (!tourWeekdays) {
      setLoadError(null);
      fetch(`/api/tours/${tourId}`, {
        headers: createAuthHeaders(),
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch tour: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.success && data.data) {
            setWeekdays({
              mondayAvailable: data.data.mondayAvailable ?? true,
              tuesdayAvailable: data.data.tuesdayAvailable ?? true,
              wednesdayAvailable: data.data.wednesdayAvailable ?? true,
              thursdayAvailable: data.data.thursdayAvailable ?? true,
              fridayAvailable: data.data.fridayAvailable ?? true,
              saturdayAvailable: data.data.saturdayAvailable ?? true,
              sundayAvailable: data.data.sundayAvailable ?? true,
            });
            setLoadError(null);
          } else {
            throw new Error(data.error || "Failed to load tour weekdays");
          }
        })
        .catch((error) => {
          console.error("Error loading tour weekdays:", error);
          setLoadError(error instanceof Error ? error.message : "Error al cargar días disponibles del tour");
          // Mantener valores por defecto (todos disponibles) después del error
        });
    }
  }, [tourId, tourWeekdays]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
  const [pendingBulkOverwrite, setPendingBulkOverwrite] = useState<PendingBulkOverwrite | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Form state
  const [formSeatsTotal, setFormSeatsTotal] = useState(20);
  const [formIsActive, setFormIsActive] = useState(true);

  const toLocalDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeLocalDate = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const getDepartureDateKey = (departure: Departure): string | null => {
    const rawDate = departure.date || departure.departureDate;
    if (!rawDate) return null;
    if (typeof rawDate === "string") {
      return rawDate.split("T")[0];
    }
    return toLocalDateKey(new Date(rawDate));
  };

  const fetchDepartures = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = toLocalDateKey(new Date(year, month, 1));
    const endDate = toLocalDateKey(new Date(year, month + 1, 0));

    try {
      const response = await fetch(
        `/api/tours/${tourId}/availability?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: createAuthHeaders(),
        }
      );
      const result = await response.json();

      if (result.success) {
        setDepartures(result.data || []);
      } else {
        setError(result.error || "Error al cargar disponibilidad");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, [tourId, currentDate]);

  // Fetch departures for current month
  useEffect(() => {
    fetchDepartures();
  }, [fetchDepartures]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: Date[] = [];

    // Días del mes anterior
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getDepartureForDate = (date: Date): Departure | undefined => {
    const dateStr = toLocalDateKey(date);
    return departures.find((d) => {
      const departureDateKey = getDepartureDateKey(d);
      return departureDateKey === dateStr;
    });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isWeekdayDisabled = (date: Date): boolean => {
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const weekdayMap: Record<number, keyof typeof weekdays> = {
      0: "sundayAvailable",
      1: "mondayAvailable",
      2: "tuesdayAvailable",
      3: "wednesdayAvailable",
      4: "thursdayAvailable",
      5: "fridayAvailable",
      6: "saturdayAvailable",
    };
    const weekdayKey = weekdayMap[dayOfWeek];
    return weekdayKey ? !weekdays[weekdayKey] : false;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDaySelect = (date: Date, departure?: Departure, event?: React.MouseEvent) => {
    // Si está en modo selección múltiple (Ctrl/Cmd presionado)
    if (event && (event.ctrlKey || event.metaKey)) {
      const dateStr = toLocalDateKey(date);
      const isSelected = selectedDates.some((d) => toLocalDateKey(d) === dateStr);
      
      if (isSelected) {
        setSelectedDates(selectedDates.filter((d) => toLocalDateKey(d) !== dateStr));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
      return;
    }

    // Comportamiento normal: abrir modal
    setSelectedDate(date);
    setSelectedDeparture(departure || null);

    if (departure) {
      setFormSeatsTotal(departure.seatsTotal);
      setFormIsActive(departure.isActive);
    } else {
      setFormSeatsTotal(20);
      setFormIsActive(true);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedDeparture(null);
  };

  const handleSave = async () => {
    if (!selectedDate) return;

    // Advertir si el día de la semana está deshabilitado, pero permitir crear manualmente
    if (isWeekdayDisabled(selectedDate)) {
      const confirmed = confirm(
        "Este día de la semana está marcado como no disponible para este tour. ¿Deseas crear disponibilidad de todas formas?"
      );
      if (!confirmed) {
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    const dateStr = toLocalDateKey(selectedDate);

    try {
      if (selectedDeparture) {
        // Update existing (horario es del tour, no por salida)
        const response = await fetch(`/api/availability/${selectedDeparture.id}`, {
          method: "PUT",
          headers: createAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            seatsTotal: formSeatsTotal,
            isActive: formIsActive,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }
      } else {
        // Create new (horario se toma del tour)
        const response = await fetch(`/api/tours/${tourId}/availability`, {
          method: "POST",
          headers: createAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            departureDate: dateStr,
            seatsTotal: formSeatsTotal,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      await fetchDepartures();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDeparture) return;

    if (!confirm("¿Estás seguro de eliminar esta disponibilidad?")) return;

    await deleteDeparture(selectedDeparture.id);
    handleCloseModal();
  };

  const handleQuickDelete = async (departureId: string) => {
    await deleteDeparture(departureId);
  };

  const deleteDeparture = async (departureId: string) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/availability/${departureId}`, {
        method: "DELETE",
        headers: createAuthHeaders(),
      });

      // El endpoint DELETE devuelve 204 No Content sin cuerpo
      if (response.status === 204) {
        await fetchDepartures();
        return;
      }

      // Si no es 204, intentar parsear JSON para errores
      if (!response.ok) {
        const result = await response.json().catch(() => ({
          success: false,
          error: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(result.error || "Error al eliminar");
      }

      // Si hay contenido, parsear JSON
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Error al eliminar");
      }

      await fetchDepartures();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper para procesar una acción bulk en una fecha específica
  const processBulkAction = async (
    action: string,
    date: Date,
    departure: Departure | null,
    params: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> => {
    const dateStr = toLocalDateKey(date);

    try {
      // Handlers para cada tipo de acción
      const actionHandlers: Record<string, () => Promise<Response>> = {
        enable: () => {
          if (departure) {
            return fetch(`/api/availability/${departure.id}`, {
              method: "PUT",
              headers: createAuthHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify({
                ...departure,
                isActive: true,
              }),
            });
          } else {
            // Crear nueva disponibilidad
            return fetch(`/api/tours/${tourId}/availability`, {
              method: "POST",
              headers: createAuthHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify({
                departureDate: dateStr,
                seatsTotal: 20,
              }),
            });
          }
        },
        disable: () => {
          if (!departure) {
            throw new Error("No existe disponibilidad para deshabilitar");
          }
          return fetch(`/api/availability/${departure.id}`, {
            method: "PUT",
            headers: createAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({
              ...departure,
              isActive: false,
            }),
          });
        },
        setSeats: () => {
          const seats = params.seats as number;
          if (departure) {
            return fetch(`/api/availability/${departure.id}`, {
              method: "PUT",
              headers: createAuthHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify({
                ...departure,
                seatsTotal: seats,
              }),
            });
          } else {
            // Crear nueva disponibilidad
            return fetch(`/api/tours/${tourId}/availability`, {
              method: "POST",
              headers: createAuthHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify({
                departureDate: dateStr,
                seatsTotal: seats,
              }),
            });
          }
        },
        setTime: () => {
          // El horario es único por tour; se configura en "Horario por defecto" del tour
          return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
        },
        delete: () => {
          if (!departure) {
            throw new Error("No existe disponibilidad para eliminar");
          }
          return fetch(`/api/availability/${departure.id}`, {
            method: "DELETE",
            headers: createAuthHeaders(),
          });
        },
      };

      const handler = actionHandlers[action];
      if (!handler) {
        throw new Error(`Acción desconocida: ${action}`);
      }

      const response = await handler();

      if (response.status === 204) {
        return { success: true };
      }

      const result = await response.json().catch(() => ({
        success: false,
        error: `Error ${response.status}: ${response.statusText}`,
      }));

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || `Error ${response.statusText}`,
        };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error de conexión",
      };
    }
  };

  // Handlers para acciones masivas
  const handleBulkAction = async (action: string, params: Record<string, any>) => {
    setIsSaving(true);
    setError(null);

    try {
      if (action === "selectRange") {
        const { startDate, endDate } = params;
        const dates: Date[] = [];
        const current = normalizeLocalDate(new Date(startDate));
        const end = normalizeLocalDate(new Date(endDate));
        
        while (current <= end) {
          dates.push(normalizeLocalDate(current));
          current.setDate(current.getDate() + 1);
        }
        
        setSelectedDates(dates);
        return;
      }

      const dates = params.dates as Date[];
      if (!dates || dates.length === 0) {
        throw new Error("No hay fechas seleccionadas");
      }

      const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
      const minDate = toLocalDateKey(sortedDates[0]);
      const maxDate = toLocalDateKey(sortedDates[sortedDates.length - 1]);

      const rangeResponse = await fetch(
        `/api/tours/${tourId}/availability?startDate=${minDate}&endDate=${maxDate}`,
        {
          headers: createAuthHeaders(),
        }
      );
      const rangeResult = await rangeResponse.json();
      if (!rangeResponse.ok || !rangeResult.success) {
        throw new Error(rangeResult.error || "No se pudo cargar disponibilidad del rango seleccionado");
      }

      const rangeDepartures: Departure[] = Array.isArray(rangeResult.data) ? rangeResult.data : [];
      const departuresByDate = new Map<string, Departure>();
      rangeDepartures.forEach((departure) => {
        const dateKey = getDepartureDateKey(departure);
        if (dateKey) {
          departuresByDate.set(dateKey, departure);
        }
      });

      if (action === "enable" || action === "setSeats") {
        const existingCount = dates.filter((date) => departuresByDate.has(toLocalDateKey(date))).length;
        if (existingCount > 0) {
          setPendingBulkOverwrite({
            action,
            params,
            dates,
            existingCount,
            departuresByDate: Object.fromEntries(departuresByDate),
          });
          setIsOverwriteModalOpen(true);
          setIsSaving(false);
          return;
        }
      }

      // Procesar cada fecha
      const errors: string[] = [];
      let successCount = 0;

      for (const date of dates) {
        const dateStr = toLocalDateKey(date);
        const departure = departuresByDate.get(dateStr) || null;
        
        const result = await processBulkAction(action, date, departure, params);
        
        if (result.success) {
          successCount++;
        } else {
          errors.push(`${dateStr}: ${result.error || "Error desconocido"}`);
        }
      }

      // Recargar departures después de todas las operaciones
      await fetchDepartures();
      setSelectedDates([]);

      // Mostrar mensaje de resultado
      if (errors.length > 0) {
        const previewErrors = errors.slice(0, 6).join(", ");
        const hiddenCount = Math.max(0, errors.length - 6);
        const hiddenSummary = hiddenCount > 0 ? ` (+${hiddenCount} más)` : "";
        setError(
          `${successCount} día(s) procesado(s) correctamente. ` +
          `${errors.length} error(es): ${previewErrors}${hiddenSummary}`
        );
      } else if (successCount > 0) {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en acción masiva");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOverwrite = () => {
    setIsOverwriteModalOpen(false);
    setPendingBulkOverwrite(null);
  };

  const handleConfirmOverwrite = async () => {
    if (!pendingBulkOverwrite) return;

    const { action, params, dates, departuresByDate } = pendingBulkOverwrite;
    setIsOverwriteModalOpen(false);
    setPendingBulkOverwrite(null);
    setIsSaving(true);
    setError(null);

    try {
      const errors: string[] = [];
      let successCount = 0;

      for (const date of dates) {
        const dateStr = toLocalDateKey(date);
        const departure = departuresByDate[dateStr] || null;
        const result = await processBulkAction(action, date, departure, params);

        if (result.success) {
          successCount++;
        } else {
          errors.push(`${dateStr}: ${result.error || "Error desconocido"}`);
        }
      }

      await fetchDepartures();
      setSelectedDates([]);

      if (errors.length > 0) {
        const previewErrors = errors.slice(0, 6).join(", ");
        const hiddenCount = Math.max(0, errors.length - 6);
        const hiddenSummary = hiddenCount > 0 ? ` (+${hiddenCount} más)` : "";
        setError(
          `${successCount} día(s) procesado(s) correctamente. ` +
          `${errors.length} error(es): ${previewErrors}${hiddenSummary}`
        );
      } else if (successCount > 0) {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en acción masiva");
    } finally {
      setIsSaving(false);
    }
  };

  const days = getDaysInMonth();

  return (
    <div className={styles.availabilityManager}>
      {loadError && (
        <div className={styles.errorMessage} style={{ padding: "12px", marginBottom: "16px", backgroundColor: "#fee", color: "#c33", borderRadius: "4px" }}>
          <strong>Error:</strong> {loadError}
        </div>
      )}
      <div className={styles.header}>
        <h3 className={styles.title}>Gestión de Disponibilidad</h3>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.available}`}></span>
            Disponible
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.low}`}></span>
            Pocos cupos
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.full}`}></span>
            Completo
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.inactive}`}></span>
            Inactivo
          </span>
        </div>
      </div>

      <div className={styles.calendarNav}>
        <Button variant="outline" size="small" onClick={handlePrevMonth}>
          <ChevronLeft size={18} />
        </Button>
        <h4 className={styles.monthYear}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        <Button variant="outline" size="small" onClick={handleNextMonth}>
          <ChevronRight size={18} />
        </Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <BulkActions
        selectedDates={selectedDates}
        onClearSelection={() => setSelectedDates([])}
        onBulkAction={handleBulkAction}
        disabled={disabled || isSaving}
      />

      {isLoading ? (
        <div className={styles.loading}>Cargando disponibilidad...</div>
      ) : (
        <div className={styles.calendar}>
          <div className={styles.weekDays}>
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className={styles.weekDay}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {days.map((date, index) => {
              const dateStr = toLocalDateKey(date);
              const isSelected = selectedDates.some((d) => toLocalDateKey(d) === dateStr);
              
              return (
                <DayCell
                  key={index}
                  date={date}
                  departure={getDepartureForDate(date)}
                  isCurrentMonth={isCurrentMonth(date)}
                  isToday={isToday(date)}
                isPast={isPast(date)}
                onSelect={(date, departure, event) => handleDaySelect(date, departure, event)}
                onDelete={!disabled ? handleQuickDelete : undefined}
                disabled={disabled}
                isWeekdayDisabled={isWeekdayDisabled(date)}
                isSelected={isSelected}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {isModalOpen && selectedDate && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h4>
                {selectedDeparture ? "Editar" : "Nueva"} Disponibilidad
              </h4>
              <button type="button" className={styles.closeBtn} onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.dateLabel}>
                {formatArDate(selectedDate, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className={styles.tourScheduleNote}>
                El horario es el configurado en &quot;Horario por defecto&quot; del tour (Información básica).
              </p>

              <Input
                label="Cupos totales"
                type="number"
                value={formSeatsTotal}
                onChange={(e) => setFormSeatsTotal(parseInt(e.target.value) || 0)}
                min={1}
                disabled={disabled}
              />

              {selectedDeparture && (
                <>
                  <div className={styles.seatsInfo}>
                    <div className={styles.seatsStat}>
                      <span>Confirmados:</span>
                      <strong>{selectedDeparture.seatsConfirmed}</strong>
                    </div>
                    <div className={styles.seatsStat}>
                      <span>Retenidos:</span>
                      <strong>{selectedDeparture.seatsHeld}</strong>
                    </div>
                    <div className={styles.seatsStat}>
                      <span>Disponibles:</span>
                      <strong>
                        {formSeatsTotal - selectedDeparture.seatsHeld - selectedDeparture.seatsConfirmed}
                      </strong>
                    </div>
                  </div>

                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      disabled={disabled}
                    />
                    Disponibilidad activa
                  </label>
                </>
              )}
            </div>

            {!disabled && (
              <div className={styles.modalFooter}>
                {selectedDeparture && (
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </Button>
                )}
                <div className={styles.modalActions}>
                  <Button variant="outline" onClick={handleCloseModal} disabled={isSaving}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleSave} 
                    disabled={isSaving}
                  >
                    <Save size={16} />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isOverwriteModalOpen}
        title="Sobrescribir disponibilidad existente"
        onClose={handleCancelOverwrite}
        size="medium"
      >
        <div className={styles.overwriteModalContent}>
          <p className={styles.overwriteMessage}>
            {pendingBulkOverwrite?.existingCount === 1
              ? "Ya existe disponibilidad en 1 fecha seleccionada."
              : `Ya existe disponibilidad en ${pendingBulkOverwrite?.existingCount || 0} fechas seleccionadas.`}
          </p>
          <p className={styles.overwriteSubmessage}>
            Si continuás, se aplicarán los nuevos valores y se sobrescribirán los datos actuales de esas fechas.
          </p>
          <div className={styles.overwriteActions}>
            <Button variant="outline" onClick={handleCancelOverwrite} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmOverwrite} disabled={isSaving}>
              Sobrescribir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
