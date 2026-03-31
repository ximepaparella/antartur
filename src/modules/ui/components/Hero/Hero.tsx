import React from "react";
import styles from "./Hero.module.scss";
import heroData from "./herodata.json";
import type { HeroContent } from "./types";
import { Button } from "@/components/common/Button/Button";

interface HeroProps {
  variant?: "home" | "internal" | "tour";
  pageKey?: keyof typeof heroData;
  /** Para variante "tour": título del tour */
  title?: string;
  /** Para variante "tour": imagen de fondo */
  backgroundImage?: string;
  /** Para variante "tour": texto del botón CTA */
  ctaText?: string;
  /** Para variante "tour": href del botón CTA (anchor link) */
  ctaHref?: string;
}

export const Hero: React.FC<HeroProps> = ({
  variant = "internal",
  pageKey,
  title,
  backgroundImage,
  ctaText = "RESERVAR",
  ctaHref = "#booking",
}) => {
  const isHome = variant === "home";
  const isTour = variant === "tour";

  if (isTour) {
    const hasBackgroundImage = Boolean(backgroundImage && backgroundImage.length > 0);

    return (
      <section
        className={`${styles.hero} ${styles.heroTour} ${!hasBackgroundImage ? styles.heroNoImage : ""}`}
      >
        {hasBackgroundImage && backgroundImage && (
          <>
            <img
              src={backgroundImage}
              alt=""
              className={styles.heroBackground}
              style={{ objectPosition: "center center" }}
              fetchPriority="high"
              decoding="async"
            />
            <div
              className={styles.overlay}
              style={{
                opacity: 0.5,
              }}
            />
          </>
        )}
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          <Button variant="secondary" href={ctaHref} className={styles.ctaButton}>
            {ctaText}
          </Button>
        </div>
      </section>
    );
  }

  const dataKey = pageKey || "home";
  const heroContent: HeroContent = (heroData[dataKey as keyof typeof heroData] || heroData.home) as HeroContent;

  const hasSubtitle = heroContent.subtitle && heroContent.subtitle.length > 0;
  const hasBackgroundImage = Boolean(heroContent.backgroundImage && heroContent.backgroundImage.length > 0);

  return (
    <section
      className={`${styles.hero} ${isHome ? styles.heroFull : styles.heroInternal} ${!hasBackgroundImage ? styles.heroNoImage : ""}`}
    >
      {hasBackgroundImage && heroContent.backgroundImage && (
        <>
          <img
            src={heroContent.backgroundImage}
            alt=""
            className={styles.heroBackground}
            style={{
              objectPosition: heroContent.backgroundPosition || "center center",
            }}
            fetchPriority="high"
            decoding="async"
          />
          <div
            className={styles.overlay}
            style={{
              opacity: heroContent.overlayOpacity || 0.5,
            }}
          />
        </>
      )}
      <div className={styles.content}>
        <h1 className={styles.title}>{heroContent.title}</h1>
        {hasSubtitle && <h3 className={styles.subtitle}>{heroContent.subtitle}</h3>}
      </div>
    </section>
  );
};
