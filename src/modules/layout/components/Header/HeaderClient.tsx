"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons/Icon";
import { CurrencySwitcher } from "@/components/common/CurrencySwitcher/CurrencySwitcher";
import headerData from "./headerdata.json";
import styles from "./Header.module.scss";

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const HeaderClient: React.FC = () => {
  const pathname = usePathname();
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Handle scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 80;
      setIsSticky(window.scrollY > scrollThreshold);
    };

    // Throttle scroll events
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenSubmenu(null);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setOpenSubmenu(null);
    }
  };

  const toggleSubmenu = (href: string) => {
    setOpenSubmenu(openSubmenu === href ? null : href);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.href));
  };

  const renderNavItem = (item: NavItem, isMobile: boolean = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.href) || hasActiveChild(item);
    const isSubmenuOpen = openSubmenu === item.href;

    if (isMobile) {
      return (
        <li key={item.href} className={styles.mobileNavItem}>
          {hasChildren ? (
            <>
              <button
                className={`${styles.mobileNavLink} ${isSubmenuOpen ? styles.mobileNavLinkOpen : ""}`}
                onClick={() => toggleSubmenu(item.href)}
                aria-expanded={isSubmenuOpen}
                aria-haspopup="true"
                aria-controls={`submenu-${item.href}`}
              >
                <span>{item.label}</span>
                <Icon
                  name="chevron-down"
                  size={16}
                  className={styles.chevronIcon}
                />
              </button>
              <ul
                id={`submenu-${item.href}`}
                className={`${styles.mobileSubmenu} ${isSubmenuOpen ? styles.mobileSubmenuOpen : ""}`}
                role="menu"
              >
                {item.children?.map((child) => (
                  <li key={child.href} role="menuitem">
                    <Link
                      href={child.href}
                      className={`${styles.mobileSubmenuLink} ${isActive(child.href) ? styles.mobileNavLinkActive : ""}`}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Link
              href={item.href}
              className={`${styles.mobileNavLink} ${isItemActive ? styles.mobileNavLinkActive : ""}`}
            >
              {item.label}
            </Link>
          )}
        </li>
      );
    }

    // Desktop rendering
    return (
      <li
        key={item.href}
        className={`${styles.navItem} ${hasChildren ? styles.navItemHasDropdown : ""}`}
      >
        <Link
          href={item.href}
          className={`${styles.navLink} ${isItemActive ? styles.navLinkActive : ""}`}
          aria-haspopup={hasChildren ? "true" : undefined}
        >
          {item.label}
        </Link>
        {hasChildren && (
          <ul className={styles.dropdown} role="menu">
            {item.children?.map((child) => (
              <li key={child.href} role="menuitem">
                <Link
                  href={child.href}
                  className={`${styles.dropdownLink} ${isActive(child.href) ? styles.dropdownLinkActive : ""}`}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  const headerClasses = `${styles.header} ${isSticky ? styles.headerSticky : ""} ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`;

  return (
    <header className={headerClasses}>
      <div className={styles.headerInner}>
        {/* Logo */}
        <Link href={headerData.logo.href} className={styles.logo}>
          <Image
            src={isSticky ? "/images/logo-color.svg" : "/images/logo-color-2.svg"}
            alt={headerData.logo.alt}
            className={styles.logoImage}
            width={150}
            height={60}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          <ul className={styles.navList} role="list">
            {headerData.navItems.map((item) => renderNavItem(item, false))}
          </ul>
        </nav>

        {/* Currency Switcher */}
        <CurrencySwitcher />

        {/* Cart Icon */}
        <Link
          href={headerData.cart.href}
          className={styles.cartIcon}
          aria-label={headerData.cart.ariaLabel}
        >
          <Icon name="bag" size={24} />
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <Icon
            name={isMobileMenuOpen ? "close" : "menu"}
            size={24}
            ariaLabel={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <nav
        id="mobile-menu"
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuVisible : ""}`}
        aria-label="Mobile navigation"
      >
        <ul className={styles.mobileNavList} role="list">
          {headerData.navItems.map((item) => renderNavItem(item, true))}
        </ul>
      </nav>
    </header>
  );
};

