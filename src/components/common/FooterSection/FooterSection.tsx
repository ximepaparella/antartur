import React from "react";
import styles from "./FooterSection.module.scss";

interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <section className={`${styles.section} ${className}`}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.content}>{children}</div>
    </section>
  );
};

