import React, { useEffect, useRef } from "react";
import { Icon } from "@/components/icons/Icon";
import styles from "./Modal.module.scss";

interface ModalProps {
  /** Si el modal está visible */
  isOpen: boolean;
  /** Título del modal */
  title?: string;
  /** Contenido del modal */
  children: React.ReactNode;
  /** Callback cuando se cierra el modal */
  onClose: () => void;
  /** Si el modal se está cerrando (para animaciones) */
  isClosing?: boolean;
  /** Tamaño del modal */
  size?: "small" | "medium" | "large";
  /** Si se puede cerrar haciendo clic fuera */
  closeOnOverlayClick?: boolean;
}

/**
 * Componente Modal genérico reutilizable
 * 
 * Modal con overlay, animaciones y cierre por tecla ESC.
 * 
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   title="Confirmar acción"
 *   onClose={() => setIsOpen(false)}
 * >
 *   <p>¿Estás seguro?</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  isClosing = false,
  size = "medium",
  closeOnOverlayClick = true,
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Guardar el elemento activo antes de abrir el modal
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus trap: mantener el foco dentro del modal
  useEffect(() => {
    if (!isOpen || !modalContentRef.current) return;

    const modalContent = modalContentRef.current;
    const focusableElements = modalContent.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus en el primer elemento al abrir
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    modalContent.addEventListener("keydown", handleTabKey);
    return () => modalContent.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  // Restaurar focus al cerrar el modal
  useEffect(() => {
    if (!isOpen && previousActiveElementRef.current) {
      previousActiveElementRef.current.focus();
      previousActiveElementRef.current = null;
    }
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${isClosing ? styles.modalOverlayClosing : ""}`}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="presentation"
      aria-hidden={!isOpen}
    >
      <div
        ref={modalContentRef}
        className={`${styles.modalContent} ${styles[`modalContent${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${isClosing ? styles.modalContentClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <button
          type="button"
          onClick={onClose}
          className={styles.modalClose}
          aria-label="Cerrar modal"
        >
          <Icon name="close" size={24} aria-hidden="true" />
        </button>

        {title && <h2 id="modal-title" className={styles.modalTitle}>{title}</h2>}

        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

