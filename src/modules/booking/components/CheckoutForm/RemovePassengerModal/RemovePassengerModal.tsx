"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button/Button";
import styles from "../CheckoutForm.module.scss";

interface RemovePassengerModalProps {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Componente RemovePassengerModal para confirmar la eliminación de un pasajero
 */
export const RemovePassengerModal: React.FC<RemovePassengerModalProps> = ({
  isOpen,
  isClosing,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      isClosing={isClosing}
      title="Eliminar pasajero"
      size="small"
      onClose={onClose}
    >
      <p>
        ¿Estás seguro de que deseas eliminar este pasajero? Esta acción no se puede deshacer.
      </p>
      <div className={styles.confirmModalActions}>
        <Button
          variant="primary"
          size="small"
          onClick={onConfirm}
        >
          Eliminar
        </Button>
        <Button
          variant="outline"
          size="small"
          onClick={onClose}
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
};

