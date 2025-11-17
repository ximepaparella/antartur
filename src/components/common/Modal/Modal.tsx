import React from "react";
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
  // Cerrar con tecla ESC
  React.useEffect(() => {
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
  React.useEffect(() => {
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
    >
      <div
        className={`${styles.modalContent} ${styles[`modalContent${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${isClosing ? styles.modalContentClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={styles.modalClose}
          aria-label="Cerrar"
        >
          <Icon name="close" size={24} />
        </button>

        {title && <h2 className={styles.modalTitle}>{title}</h2>}

        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

