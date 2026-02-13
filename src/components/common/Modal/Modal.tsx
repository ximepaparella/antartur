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
    // Verificar que estamos en el navegador
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus trap: mantener el foco dentro del modal
  useEffect(() => {
    // Verificar que estamos en el navegador
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    
    if (!isOpen) return;

    let handleTabKey: ((e: Event) => void) | null = null;
    let modalContent: Element | null = null;

    // Usar un pequeño delay para asegurar que el DOM esté completamente renderizado
    const timeoutId = setTimeout(() => {
      if (!modalContentRef.current) {
        console.warn("[Modal] modalContentRef.current es null después del timeout");
        return;
      }

      modalContent = modalContentRef.current;
      
      // Verificar que modalContent es un elemento DOM válido
      if (!(modalContent instanceof Element)) {
        console.warn("[Modal] modalContentRef.current no es una instancia de Element");
        return;
      }
      
      // Verificar que querySelectorAll está disponible
      if (typeof modalContent.querySelectorAll !== "function") {
        console.warn("[Modal] querySelectorAll no está disponible en modalContent");
        return;
      }
      
      try {
        const focusableElements = modalContent.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        // Focus en el primer elemento al abrir (con check defensivo)
        if (firstFocusable && typeof firstFocusable.focus === 'function') {
          try {
            firstFocusable.focus();
          } catch (error) {
            console.warn("[Modal] Error focusing first element:", error);
          }
        }

        handleTabKey = (e: Event) => {
          const keyEvent = e as KeyboardEvent;
          if (keyEvent.key !== "Tab") return;

          if (keyEvent.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
              keyEvent.preventDefault();
              lastFocusable?.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastFocusable) {
              keyEvent.preventDefault();
              firstFocusable?.focus();
            }
          }
        };

        modalContent.addEventListener("keydown", handleTabKey);
      } catch (error) {
        console.error("[Modal] Error en focus trap:", error);
      }
    }, 0);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (handleTabKey && modalContent) {
        modalContent.removeEventListener("keydown", handleTabKey);
      }
    };
  }, [isOpen]);

  // Restaurar focus al cerrar el modal
  useEffect(() => {
    // Verificar que estamos en el navegador
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    
    if (!isOpen && previousActiveElementRef.current) {
      try {
        previousActiveElementRef.current.focus();
      } catch (error) {
        console.warn("[Modal] Error al restaurar focus:", error);
      }
      previousActiveElementRef.current = null;
    }
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    // Verificar que estamos en el navegador
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    
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
    // Verificar que estamos en el navegador
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      if (typeof document !== "undefined" && document.body) {
        document.body.style.overflow = "";
      }
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
        tabIndex={-1}
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

