"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { formatArDate } from "@/lib/utils/dateTimeAr";
import styles from "./PaymentGatewayCard.module.scss";

export interface BankTransferData {
  id: string;
  isActive: boolean;
  accountName: string;
  accountNumber: string;
  bank: string;
  cuit: string;
  cbu: string;
  alias: string;
  updatedAt: string;
}

interface BankTransferCardProps {
  bankTransfer: BankTransferData;
  onToggleActive: (isActive: boolean) => Promise<void>;
  onSave: (data: Partial<BankTransferData>) => Promise<void>;
}

export const BankTransferCard: React.FC<BankTransferCardProps> = ({
  bankTransfer,
  onToggleActive,
  onSave,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BankTransferData>>({
    accountName: bankTransfer.accountName,
    accountNumber: bankTransfer.accountNumber,
    bank: bankTransfer.bank,
    cuit: bankTransfer.cuit,
    cbu: bankTransfer.cbu,
    alias: bankTransfer.alias,
  });

  const handleToggleActive = async () => {
    setIsUpdating(true);
    try {
      await onToggleActive(!bankTransfer.isActive);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onSave(formData);
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      accountName: bankTransfer.accountName,
      accountNumber: bankTransfer.accountNumber,
      bank: bankTransfer.bank,
      cuit: bankTransfer.cuit,
      cbu: bankTransfer.cbu,
      alias: bankTransfer.alias,
    });
    setIsEditing(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.providerInfo}>
          <div className={styles.iconWrapper}>
            <Icon name="credit-card" size={24} />
          </div>
          <div className={styles.providerDetails}>
            <h3 className={styles.providerName}>Transferencia Bancaria</h3>
            <span className={styles.currency}>Pesos Argentinos (ARS)</span>
          </div>
        </div>
        <div className={styles.statusBadge}>
          {bankTransfer.isActive ? (
            <span className={styles.activeBadge}>Activo</span>
          ) : (
            <span className={styles.inactiveBadge}>Inactivo</span>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {/* Toggle Activo */}
        <div className={styles.toggles}>
          <div className={styles.toggleItem}>
            <span className={styles.toggleLabel}>Activo</span>
            <button
              className={`${styles.toggle} ${bankTransfer.isActive ? styles.toggleOn : styles.toggleOff}`}
              onClick={handleToggleActive}
              disabled={isUpdating}
            >
              <span className={styles.toggleHandle} />
            </button>
          </div>
        </div>

        {/* Datos Bancarios */}
        {isEditing ? (
          <div className={styles.bankDataForm}>
            <div className={styles.formField}>
              <Input
                label="Titular de la cuenta"
                value={formData.accountName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.formField}>
              <Input
                label="Número de cuenta"
                value={formData.accountNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.formField}>
              <Input
                label="Banco"
                value={formData.bank || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bank: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.formField}>
              <Input
                label="CUIT"
                value={formData.cuit || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cuit: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.formField}>
              <Input
                label="CBU"
                value={formData.cbu || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cbu: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.formField}>
              <Input
                label="Alias"
                value={formData.alias || ""}
                onChange={(e) =>
                  setFormData({ ...formData, alias: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.formActions}>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isUpdating}
              >
                Guardar
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.bankDataDisplay}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Titular:</span>
              <span className={styles.dataValue}>{bankTransfer.accountName}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Número de cuenta:</span>
              <span className={styles.dataValue}>{bankTransfer.accountNumber}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Banco:</span>
              <span className={styles.dataValue}>{bankTransfer.bank}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>CUIT:</span>
              <span className={styles.dataValue}>{bankTransfer.cuit}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>CBU:</span>
              <span className={styles.dataValue}>{bankTransfer.cbu}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Alias:</span>
              <span className={styles.dataValue}>{bankTransfer.alias}</span>
            </div>
            <div className={styles.editButtonWrapper}>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Editar datos
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.lastUpdate}>
          Última actualización: {formatArDate(bankTransfer.updatedAt, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};
