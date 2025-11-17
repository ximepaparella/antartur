import React from "react";
import styles from "./Hero.module.scss";
import heroData from "./herodata.json";
import type { HeroContent } from "./types";

interface HeroProps {
  variant?: "home" | "internal";
  pageKey?: keyof typeof heroData;
}

export const Hero: React.FC<HeroProps> = ({ variant = "internal", pageKey }) => {
  // Si no se proporciona pageKey, intentar inferirlo desde la ruta o usar home
  const dataKey = pageKey || "home";
  const heroContent: HeroContent = (heroData[dataKey as keyof typeof heroData] || heroData.home) as HeroContent;

  const isHome = variant === "home";
  const hasSubtitle = heroContent.subtitle && heroContent.subtitle.length > 0;
  const hasBackgroundImage = heroContent.backgroundImage && heroContent.backgroundImage.length > 0;

  // Estilos dinámicos
  const sectionStyle: React.CSSProperties = {
    backgroundPosition: heroContent.backgroundPosition || "center center",
  };

  if (hasBackgroundImage) {
    sectionStyle.backgroundImage = `url(${heroContent.backgroundImage})`;
  }

  return (
    <section
      className={`${styles.hero} ${isHome ? styles.heroFull : styles.heroInternal} ${!hasBackgroundImage ? styles.heroNoImage : ""}`}
      style={sectionStyle}
    >
      {hasBackgroundImage && (
        <div
          className={styles.overlay}
          style={{
            opacity: heroContent.overlayOpacity || 0.5,
          }}
        />
      )}
      <div className={styles.content}>
        <h1 className={styles.title}>{heroContent.title}</h1>
        {hasSubtitle && (
          <h3 className={styles.subtitle}>{heroContent.subtitle}</h3>
        )}
      </div>
    </section>
  );
};

