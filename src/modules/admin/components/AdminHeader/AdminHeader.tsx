"use client";

import { useAdminAuth } from "../../hooks/useAdminAuth";
import { Button } from "@/components/common/Button/Button";
import { Icon } from "@/components/icons/Icon";
import styles from "./AdminHeader.module.scss";

export function AdminHeader() {
  const { user, logout } = useAdminAuth();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.left}>
          <h1 className={styles.title}>Panel de Administración</h1>
        </div>

        <div className={styles.right}>
          <div className={styles.userInfo}>
            <Icon name="users" size={20} />
            <span className={styles.userName}>{user?.name || "Admin"}</span>
          </div>

          <Button
            variant="outline"
            size="small"
            onClick={logout}
            className={styles.logoutButton}
          >
            <Icon name="close" size={16} />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

