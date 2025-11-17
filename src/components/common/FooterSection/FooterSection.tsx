import React from "react";
import styles from "./FooterSection.module.scss";

interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  title,
  children,
  className = "",
  titleClassName = "",
  contentClassName = "",
}) => {
  return (
    <section className={`${styles.section} ${className}`}>
      <h3 className={`${styles.title} ${titleClassName}`}>{title}</h3>
      <div className={`${styles.content} ${contentClassName}`}>{children}</div>
    </section>
  );
};

