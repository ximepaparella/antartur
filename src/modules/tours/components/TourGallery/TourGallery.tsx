"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import styles from "./TourGallery.module.scss";

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  blurDataURL?: string;
}

interface TourGalleryProps {
  /** Array de imágenes para la galería */
  images: GalleryImage[];
}

/**
 * Componente TourGallery para mostrar un carousel horizontal de imágenes
 * Full width, sin gaps, desliza 3 imágenes en desktop y 1 en mobile
 * Optimizado para performance y Web Vitals
 */
export const TourGallery: React.FC<TourGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  // Debounce para el resize listener
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const updateSlidesToShow = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(1);
      } else {
        setSlidesToShow(3);
      }
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSlidesToShow, 150);
    };

    updateSlidesToShow();
    window.addEventListener("resize", handleResize, { passive: true });
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const maxIndex = useMemo(
    () => Math.max(0, images.length - slidesToShow),
    [images.length, slidesToShow]
  );

  const slideWidth = useMemo(() => 100 / slidesToShow, [slidesToShow]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return maxIndex;
      }
      return prev - 1;
    });
  }, [maxIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) {
        return 0;
      }
      return prev + 1;
    });
  }, [maxIndex]);


  if (images.length === 0) {
    return null;
  }

  const transformValue = `translateX(-${currentIndex * slideWidth}%)`;

  return (
    <section className={styles.gallery}>
      <div className={styles.carousel}>
        <button
          className={styles.navButton}
          onClick={goToPrevious}
          aria-label="Imagen anterior"
          type="button"
        >
          <svg
            className={styles.arrowIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        <div className={styles.slidesContainer}>
          <div
            className={styles.slides}
            style={{ 
              transform: transformValue,
            }}
          >
            {images.map((image, index) => {
              if (!image.src || image.src.trim() === "") return null;
              return (
              <div 
                key={image.id} 
                className={styles.slide} 
                style={{ width: `${slideWidth}%` }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  className={styles.image}
                  width={800}
                  height={400}
                  priority={index === 0}
                  placeholder={image.blurDataURL ? "blur" : undefined}
                  blurDataURL={image.blurDataURL}
                />
              </div>
              );
            })}
          </div>
        </div>
        
        <button
          className={styles.navButton}
          onClick={goToNext}
          aria-label="Imagen siguiente"
          type="button"
        >
          <svg
            className={styles.arrowIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

