"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { Select } from "@/components/common/Select/Select";
import { Calendar, X, CheckSquare, Square, Trash2, Users, Clock, Power, PowerOff } from "lucide-react";
import styles from "./BulkActions.module.scss";

// Generar opciones de horarios (cada hora en punto y y media, de 6:00 a 23:30)
const generateTimeOptions = () => {
  const options: Array<{ value: string; label: string }> = [];
  for (let hour = 6; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, "0");
    options.push({ value: `${hourStr}:00`, label: `${hourStr}:00` });
    options.push({ value: `${hourStr}:30`, label: `${hourStr}:30` });
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

interface BulkActionsProps {
  selectedDates: Date[];
  onClearSelection: () => void;
  onBulkAction: (action: string, params: Record<string, any>) => Promise<void>;
  disabled?: boolean;
}

export function BulkActions({
  selectedDates,
  onClearSelection,
  onBulkAction,
  disabled = false,
}: BulkActionsProps) {
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulario para acciones masivas
  const [bulkSeats, setBulkSeats] = useState("");
  const [bulkStartTime, setBulkStartTime] = useState("09:00");
  const [bulkEndTime, setBulkEndTime] = useState("");

  const handleRangeSelect = async () => {
    if (!startDate || !endDate) {
      setError("Selecciona fecha de inicio y fin");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await onBulkAction("selectRange", { startDate: start, endDate: end });
      setStartDate("");
      setEndDate("");
      setIsRangeMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al seleccionar rango");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkEnable = async () => {
    if (selectedDates.length === 0) {
      setError("Selecciona al menos un día");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await onBulkAction("enable", { dates: selectedDates });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al habilitar");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDisable = async () => {
    if (selectedDates.length === 0) {
      setError("Selecciona al menos un día");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await onBulkAction("disable", { dates: selectedDates });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al deshabilitar");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkSetSeats = async () => {
    if (selectedDates.length === 0) {
      setError("Selecciona al menos un día");
      return;
    }

    const seats = parseInt(bulkSeats);
    if (isNaN(seats) || seats < 1) {
      setError("Ingresa un número válido de cupos (mínimo 1)");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await onBulkAction("setSeats", { dates: selectedDates, seats });
      setBulkSeats("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al establecer cupos");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkSetTime = async () => {
    if (selectedDates.length === 0) {
      setError("Selecciona al menos un día");
      return;
    }

    if (!bulkStartTime) {
      setError("Ingresa una hora de inicio");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await onBulkAction("setTime", {
        dates: selectedDates,
        startTime: bulkStartTime,
        endTime: bulkEndTime || null,
      });
      setBulkStartTime("09:00");
      setBulkEndTime("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al establecer hora");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDates.length === 0) {
      setError("Selecciona al menos un día");
      return;
    }

    if (!confirm(`¿Eliminar disponibilidad de ${selectedDates.length} día(s)?`)) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await onBulkAction("delete", { dates: selectedDates });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedDates.length === 0 && !isRangeMode) {
    return (
      <div className={styles.bulkActions}>
        <Button
          variant="outline"
          onClick={() => setIsRangeMode(true)}
          disabled={disabled}
          className={styles.rangeButton}
        >
          <Calendar size={16} />
          Seleccionar Rango
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.bulkActions}>
      {isRangeMode ? (
        <div className={styles.rangeSelector}>
          <div className={styles.rangeInputs}>
            <Input
              label="Fecha inicio"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={disabled || isProcessing}
            />
            <Input
              label="Fecha fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={disabled || isProcessing}
            />
            <div className={styles.rangeActions}>
              <Button
                variant="primary"
                onClick={handleRangeSelect}
                disabled={disabled || isProcessing}
                size="small"
              >
                Seleccionar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRangeMode(false);
                  setStartDate("");
                  setEndDate("");
                  setError(null);
                }}
                disabled={isProcessing}
                size="small"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.selectionInfo}>
            <span className={styles.selectedCount}>
              {selectedDates.length} día(s) seleccionado(s)
            </span>
            <Button
              variant="outline"
              size="small"
              onClick={onClearSelection}
              disabled={disabled || isProcessing}
            >
              <X size={14} />
              Limpiar
            </Button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actionsGrid}>
            <div className={styles.actionGroup}>
              <h5 className={styles.actionTitle}>Estado</h5>
              <div className={styles.actionButtons}>
                <Button
                  variant="primary"
                  onClick={handleBulkEnable}
                  disabled={disabled || isProcessing}
                  size="small"
                >
                  <Power size={14} />
                  Habilitar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBulkDisable}
                  disabled={disabled || isProcessing}
                  size="small"
                >
                  <PowerOff size={14} />
                  Deshabilitar
                </Button>
              </div>
            </div>

            <div className={styles.actionGroup}>
              <h5 className={styles.actionTitle}>Cupos</h5>
              <div className={styles.actionForm}>
                <Input
                  type="number"
                  value={bulkSeats}
                  onChange={(e) => setBulkSeats(e.target.value)}
                  placeholder="Cupos"
                  disabled={disabled || isProcessing}
                />
                <Button
                  variant="primary"
                  onClick={handleBulkSetSeats}
                  disabled={disabled || isProcessing || !bulkSeats}
                  size="small"
                >
                  <Users size={14} />
                  Aplicar
                </Button>
              </div>
            </div>

            <div className={styles.actionGroup}>
              <h5 className={styles.actionTitle}>Horario</h5>
              <div className={styles.actionForm}>
                <Select
                  value={bulkStartTime}
                  onChange={(e) => setBulkStartTime(e.target.value)}
                  disabled={disabled || isProcessing}
                  options={[
                    { value: "", label: "Seleccionar..." },
                    ...TIME_OPTIONS,
                  ]}
                />
                <Select
                  value={bulkEndTime}
                  onChange={(e) => setBulkEndTime(e.target.value)}
                  disabled={disabled || isProcessing}
                  options={[
                    { value: "", label: "Sin hora fin" },
                    ...TIME_OPTIONS,
                  ]}
                />
                <Button
                  variant="primary"
                  onClick={handleBulkSetTime}
                  disabled={disabled || isProcessing || !bulkStartTime}
                  size="small"
                >
                  <Clock size={14} />
                  Aplicar
                </Button>
              </div>
            </div>

            <div className={styles.actionGroup}>
              <h5 className={styles.actionTitle}>Eliminar</h5>
              <Button
                variant="danger"
                onClick={handleBulkDelete}
                disabled={disabled || isProcessing}
                size="small"
              >
                <Trash2 size={14} />
                Eliminar Seleccionados
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

