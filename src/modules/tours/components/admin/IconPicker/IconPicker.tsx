"use client";

import { useState, useRef, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/common/Input/Input";
import { LUCIDE_ICONS, LucideIconName } from "./lucideIcons";
import type { IconPickerProps } from "@/modules/tours/types/admin";
import styles from "./IconPicker.module.scss";

// Helper para obtener el componente del icono dinámicamente
function getIconComponent(name: string): React.ComponentType<{ size?: number }> | null {
  // Convertir nombre kebab-case a PascalCase
  const pascalCase = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>;
  const IconComponent = icons[pascalCase];
  return IconComponent || null;
}

export function IconPicker({
  value,
  onChange,
  label,
  disabled = false,
  placeholder = "Seleccionar icono",
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar iconos por búsqueda
  const filteredIcons = LUCIDE_ICONS.filter(
    (icon) =>
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icon.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const SelectedIcon = value ? getIconComponent(value) : null;

  return (
    <div className={styles.iconPicker} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}

      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className={styles.selectedValue}>
          {SelectedIcon ? (
            <>
              <SelectedIcon size={18} />
              <span>{value}</span>
            </>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </div>
        <div className={styles.actions}>
          {value && !disabled && (
            <span className={styles.clearBtn} onClick={handleClear}>
              <X size={14} />
            </span>
          )}
          <ChevronDown size={18} className={styles.chevron} />
        </div>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar icono..."
              className={styles.searchInput}
              autoFocus
            />
          </div>

          <div className={styles.iconGrid}>
            {filteredIcons.length === 0 ? (
              <div className={styles.noResults}>No se encontraron iconos</div>
            ) : (
              filteredIcons.map((icon) => {
                const IconComponent = getIconComponent(icon.name);
                if (!IconComponent) return null;

                return (
                  <button
                    key={icon.name}
                    type="button"
                    className={`${styles.iconOption} ${value === icon.name ? styles.selected : ""}`}
                    onClick={() => handleSelect(icon.name)}
                    title={icon.label}
                  >
                    <IconComponent size={20} />
                    <span className={styles.iconLabel}>{icon.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

