"use client";

import { AdminSidebar } from "../AdminSidebar";
import { AdminHeader } from "../AdminHeader";
import styles from "./AdminLayout.module.scss";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <div className={styles.contentWrapper}>
        <AdminHeader />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}

