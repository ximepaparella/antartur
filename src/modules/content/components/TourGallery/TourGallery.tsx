"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./TourGallery.module.scss";

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

interface TourGalleryProps {
  /** Array de imágenes para la galería */
  images: GalleryImage[];
}

/**
 * Componente TourGallery para mostrar un carousel horizontal de imágenes
 */
export const TourGallery: React.FC<TourGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className={styles.gallery}>
      <div className={styles.container}>
        <div className={styles.carousel}>
          <button
            className={styles.navButton}
            onClick={goToPrevious}
            aria-label="Imagen anterior"
          >
            ‹
          </button>
          
          <div className={styles.slidesContainer}>
            <div
              className={styles.slides}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((image) => (
                <div key={image.id} className={styles.slide}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={1200}
                    height={600}
                    className={styles.image}
                    priority={image.id === images[0].id}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button
            className={styles.navButton}
            onClick={goToNext}
            aria-label="Imagen siguiente"
          >
            ›
          </button>
        </div>
        
        {images.length > 1 && (
          <div className={styles.dots}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ""}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

