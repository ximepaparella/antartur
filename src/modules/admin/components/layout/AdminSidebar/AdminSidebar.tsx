"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import styles from "./AdminSidebar.module.scss";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "calendar" },
  { href: "/admin/tours", label: "Tours", icon: "map-route" },
  { href: "/admin/orders", label: "Órdenes", icon: "credit-card" },
  { href: "/admin/bookings", label: "Reservas", icon: "book-a" },
  { href: "/admin/notifications", label: "Notificaciones", icon: "email" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2 className={styles.logoText}>Antartur</h2>
        <span className={styles.logoSubtext}>Admin</span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href} className={styles.navItem}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                >
                  <Icon name={item.icon as any} size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

