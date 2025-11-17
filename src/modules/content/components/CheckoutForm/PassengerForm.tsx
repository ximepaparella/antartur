"use client";

import React, { useState } from "react";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button/Button";
import { Icon } from "@/components/icons/Icon";
import type { Passenger } from "@/lib/types/order";
import styles from "./CheckoutForm.module.scss";

interface PassengerFormProps {
  /** Número del pasajero (1, 2, 3...) */
  passengerNumber: number;
  /** Si es adulto o niño */
  isAdult: boolean;
  /** Datos del pasajero */
  passenger: Passenger;
  /** Callback cuando cambian los datos */
  onChange: (passenger: Passenger) => void;
  /** Callback para validar un campo específico */
  onValidateField?: (field: string, value: any) => void;
  /** Si el tour tiene restricciones para embarazadas */
  hasPregnancyRestriction?: boolean;
  /** Si el tour tiene restricciones para problemas de columna/salud */
  hasHealthRestriction?: boolean;
  /** Errores de validación para este pasajero */
  errors?: Record<string, string>;
  /** Si este pasajero tiene errores */
  hasErrors?: boolean;
  /** Si se puede eliminar este pasajero */
  canRemove?: boolean;
  /** Callback para eliminar este pasajero */
  onRemove?: () => void;
}

/**
 * Componente para el formulario de un pasajero individual
 */
export const PassengerForm: React.FC<PassengerFormProps> = ({
  passengerNumber,
  isAdult,
  passenger,
  onChange,
  onValidateField,
  hasPregnancyRestriction = false,
  hasHealthRestriction = false,
  errors = {},
  hasErrors = false,
  canRemove = false,
  onRemove,
}) => {
  const [isExpanded, setIsExpanded] = useState(passengerNumber === 1);
  const [showAllergiesInput, setShowAllergiesInput] = useState(
    passenger.restriccionesAlimentarias?.alergias || false
  );

  const handleChange = (field: keyof Passenger, value: any) => {
    onChange({
      ...passenger,
      [field]: value,
    });
  };

  const handleRestrictionChange = (field: keyof NonNullable<Passenger["restriccionesAlimentarias"]>, checked: boolean) => {
    const currentRestrictions = passenger.restriccionesAlimentarias || {};
    const newRestrictions = {
      ...currentRestrictions,
      [field]: checked,
    };

    if (field === "alergias" && !checked) {
      delete newRestrictions.alergiasDetalle;
      setShowAllergiesInput(false);
    } else if (field === "alergias" && checked) {
      setShowAllergiesInput(true);
    }

    handleChange("restriccionesAlimentarias", newRestrictions);
  };

  const handleAllergiesDetailChange = (value: string) => {
    const currentRestrictions = passenger.restriccionesAlimentarias || {};
    handleChange("restriccionesAlimentarias", {
      ...currentRestrictions,
      alergiasDetalle: value,
    });
  };

  // Generar opciones de años para fecha de nacimiento
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const yearOptions = years.map((year) => ({ value: year.toString(), label: year.toString() }));

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthOptions = months.map((month) => ({
    value: month.toString().padStart(2, "0"),
    label: month.toString().padStart(2, "0"),
  }));

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const dayOptions = days.map((day) => ({
    value: day.toString().padStart(2, "0"),
    label: day.toString().padStart(2, "0"),
  }));

  // Parsear fecha de nacimiento
  const fechaNacimiento = passenger.fechaNacimiento || "";
  const fechaParts = fechaNacimiento ? fechaNacimiento.split("-") : [];
  const birthYear = fechaParts[0] || "";
  const birthMonth = fechaParts[1] ? fechaParts[1].padStart(2, "0") : "";
  const birthDay = fechaParts[2] ? fechaParts[2].padStart(2, "0") : "";

  const handleDateChange = (type: "year" | "month" | "day", value: string) => {
    const newYear = type === "year" ? value : birthYear;
    const newMonth = type === "month" ? value : birthMonth;
    const newDay = type === "day" ? value : birthDay;
    
    if (newYear && newMonth && newDay) {
      const dateStr = `${newYear}-${newMonth}-${newDay}`;
      handleChange("fechaNacimiento", dateStr);
      // Validar cuando se completa la fecha
      onValidateField?.("fechaNacimiento", dateStr);
    } else {
      // Si la fecha está incompleta, validar para limpiar errores si el campo ya no está vacío
      // pero solo validar si hay un valor parcial
      if (newYear || newMonth || newDay) {
        // Validar con el valor actual (puede estar incompleto)
        onValidateField?.("fechaNacimiento", passenger.fechaNacimiento || "");
      }
    }
  };

  return (
    <div className={styles.passengerForm}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`${styles.passengerHeader} ${hasErrors ? styles.passengerHeaderError : ""}`}
        aria-expanded={isExpanded}
      >
        <div className={`${styles.passengerHeaderContent} ${hasErrors ? styles.passengerHeaderContentError : ""}`}>
          <Icon 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            className={styles.chevronIcon}
          />
          <h3 className={styles.passengerTitle}>
            {isAdult ? `Pasajero Adulto ${passengerNumber}` : `Pasajero Menor ${passengerNumber}`}
          </h3>
        </div>
      </button>

      {isExpanded && (
        <div className={styles.passengerContent}>
          {canRemove && onRemove && (
            <div className={styles.removeButtonWrapper}>
              <Button
                variant="outline"
                size="small"
                onClick={onRemove}
                aria-label={`Eliminar ${isAdult ? "adulto" : "niño"} ${passengerNumber}`}
              >
                <Icon name="close" size={16} />
                Eliminar {isAdult ? "adulto" : "niño"}
              </Button>
            </div>
          )}
          <div className={styles.formRow}>
        <Input
          label="Nombre Completo"
          name={`passenger-${passengerNumber}-nombre`}
          required
          value={passenger.nombreCompleto}
          onChange={(e) => handleChange("nombreCompleto", e.target.value)}
          onBlur={(e) => onValidateField?.("nombreCompleto", e.target.value)}
          error={errors.nombreCompleto}
          className={styles.formGroup}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Fecha de Nacimiento <span className={styles.required}>*</span>
          </label>
          <div className={styles.dateInputs}>
            <Select
              name={`passenger-${passengerNumber}-day`}
              options={dayOptions}
              value={birthDay}
              onChange={(e) => handleDateChange("day", e.target.value)}
              className={styles.dateSelect}
            />
            <Select
              name={`passenger-${passengerNumber}-month`}
              options={monthOptions}
              value={birthMonth}
              onChange={(e) => handleDateChange("month", e.target.value)}
              className={styles.dateSelect}
            />
            <Select
              name={`passenger-${passengerNumber}-year`}
              options={yearOptions}
              value={birthYear}
              onChange={(e) => handleDateChange("year", e.target.value)}
              className={styles.dateSelect}
            />
          </div>
        </div>
          </div>

          <div className={styles.formRow}>
            <Input
              label="Documento o Pasaporte"
          name={`passenger-${passengerNumber}-documento`}
          required
          value={passenger.documento}
          onChange={(e) => handleChange("documento", e.target.value)}
          onBlur={(e) => onValidateField?.("documento", e.target.value)}
              error={errors.documento}
              className={styles.formGroup}
            />
          </div>

          <div className={styles.formRow}>
            <Input
              label="Dirección"
          name={`passenger-${passengerNumber}-direccion`}
          required
          value={passenger.direccion}
          onChange={(e) => handleChange("direccion", e.target.value)}
          onBlur={(e) => onValidateField?.("direccion", e.target.value)}
              error={errors.direccion}
              className={styles.formGroup}
            />
          </div>

          <div className={styles.formRow}>
            <Input
              label="Teléfono"
          name={`passenger-${passengerNumber}-telefono`}
          type="tel"
          required
          value={passenger.telefono}
          onChange={(e) => handleChange("telefono", e.target.value)}
          onBlur={(e) => onValidateField?.("telefono", e.target.value)}
              error={errors.telefono}
              className={styles.formGroup}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                ¿Tiene restricciones alimentarias? <span className={styles.required}>*</span>
              </label>
              <div className={styles.radioGroup}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name={`restrictions-${passengerNumber}`}
                checked={passenger.tieneRestriccionesAlimentarias === true}
                onChange={() => {
                  handleChange("tieneRestriccionesAlimentarias", true);
                  onValidateField?.("restricciones", true);
                }}
                onBlur={() => onValidateField?.("restricciones", passenger.tieneRestriccionesAlimentarias)}
              />
              <span>Sí</span>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name={`restrictions-${passengerNumber}`}
                checked={passenger.tieneRestriccionesAlimentarias === false}
                onChange={() => {
                  handleChange("tieneRestriccionesAlimentarias", false);
                  onValidateField?.("restricciones", false);
                }}
                onBlur={() => onValidateField?.("restricciones", passenger.tieneRestriccionesAlimentarias)}
              />
                <span>No</span>
              </label>
            </div>
            {errors.restricciones && (
              <span className={styles.errorMessage}>{errors.restricciones}</span>
            )}
            {errors.alergias && (
              <span className={styles.errorMessage}>{errors.alergias}</span>
            )}
          </div>
          </div>

          {passenger.tieneRestriccionesAlimentarias && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de restricción:</label>
                <div className={styles.checkboxGroup}>
              <label className={styles.checkboxOption}>
                <input
                  type="checkbox"
                  checked={passenger.restriccionesAlimentarias?.vegetariano || false}
                  onChange={(e) => handleRestrictionChange("vegetariano", e.target.checked)}
                />
                <span>Vegetariano</span>
              </label>
              <label className={styles.checkboxOption}>
                <input
                  type="checkbox"
                  checked={passenger.restriccionesAlimentarias?.vegano || false}
                  onChange={(e) => handleRestrictionChange("vegano", e.target.checked)}
                />
                <span>Vegano</span>
              </label>
              <label className={styles.checkboxOption}>
                <input
                  type="checkbox"
                  checked={passenger.restriccionesAlimentarias?.celiaco || false}
                  onChange={(e) => handleRestrictionChange("celiaco", e.target.checked)}
                />
                <span>Celiaco</span>
              </label>
              <label className={styles.checkboxOption}>
                <input
                  type="checkbox"
                  checked={passenger.restriccionesAlimentarias?.alergias || false}
                  onChange={(e) => handleRestrictionChange("alergias", e.target.checked)}
                />
                  <span>Alergias</span>
                </label>
              </div>
              {showAllergiesInput && (
                <Input
                  label="Especifique las alergias"
                  name={`passenger-${passengerNumber}-alergias`}
                  value={passenger.restriccionesAlimentarias?.alergiasDetalle || ""}
                  onChange={(e) => handleAllergiesDetailChange(e.target.value)}
                  onBlur={(e) => onValidateField?.("alergias", e.target.value)}
                  className={styles.formGroup}
                  style={{ marginTop: "8px" }}
                />
              )}
            </div>
          </div>
          )}

          {isAdult && (
            <>
              {hasPregnancyRestriction && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      ¿Está embarazada? <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.radioGroup}>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name={`pregnancy-${passengerNumber}`}
                      checked={passenger.embarazada === true}
                      onChange={() => {
                        handleChange("embarazada", true);
                        onValidateField?.("embarazada", true);
                      }}
                      onBlur={() => onValidateField?.("embarazada", passenger.embarazada)}
                    />
                    <span>Sí</span>
                  </label>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name={`pregnancy-${passengerNumber}`}
                      checked={passenger.embarazada === false}
                      onChange={() => {
                        handleChange("embarazada", false);
                        onValidateField?.("embarazada", false);
                      }}
                      onBlur={() => onValidateField?.("embarazada", passenger.embarazada)}
                    />
                      <span>No</span>
                    </label>
                  </div>
                  {errors.embarazada && (
                    <span className={styles.errorMessage}>{errors.embarazada}</span>
                  )}
                </div>
              </div>
            )}

            {hasHealthRestriction && (
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    ¿Tiene problemas de columna o de salud? <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.radioGroup}>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name={`health-${passengerNumber}`}
                      checked={passenger.problemasColumnaSalud === true}
                      onChange={() => {
                        handleChange("problemasColumnaSalud", true);
                        onValidateField?.("salud", true);
                      }}
                      onBlur={() => onValidateField?.("salud", passenger.problemasColumnaSalud)}
                    />
                    <span>Sí</span>
                  </label>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name={`health-${passengerNumber}`}
                      checked={passenger.problemasColumnaSalud === false}
                      onChange={() => {
                        handleChange("problemasColumnaSalud", false);
                        onValidateField?.("salud", false);
                      }}
                      onBlur={() => onValidateField?.("salud", passenger.problemasColumnaSalud)}
                    />
                      <span>No</span>
                    </label>
                  </div>
                  {errors.salud && (
                    <span className={styles.errorMessage}>{errors.salud}</span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        </div>
      )}
    </div>
  );
};

