import React from "react";
import styles from "./Heading.module.scss";
import { Icon, IconName } from "@/components/icons/Icon";

interface HeadingProps {
  /** Título principal (h2) */
  title: string;
  /** Párrafo descriptivo opcional (puede ser un string o un array de strings para múltiples párrafos) */
  paragraph?: string | string[];
  /** Nombre del icono opcional (usa el componente Icon) */
  iconName?: IconName;
  /** Variante del título (por defecto usa font-size-40) */
  variant?: "default" | "large";
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  paragraph,
  iconName,
  variant = "default",
}) => {
  const paragraphs = paragraph 
    ? Array.isArray(paragraph) 
      ? paragraph 
      : [paragraph]
    : [];

  return (
    <section className={styles.heading}>
      {iconName && (
        <div className={styles.iconWrapper}>
          <Icon name={iconName} size={48} ariaLabel="" />
        </div>
      )}
      <h2 className={`${styles.title} ${variant === "large" ? styles.titleLarge : ""}`}>
        {title}
      </h2>
      {paragraphs.length > 0 && (
        <div className={styles.paragraphsWrapper}>
          {paragraphs.map((para, index) => (
            <p key={index} className={styles.paragraph}>
              {para}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};

