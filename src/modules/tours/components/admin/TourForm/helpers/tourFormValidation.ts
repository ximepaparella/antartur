/**
 * Helper functions for TourForm validation and data sanitization
 */

import type { TourFormData, TourImage, QuickInfoItem, TimelineItem, FeaturedInfo, Testimonial } from "../types";

export interface ValidationResult {
  valid: boolean;
  invalidIndices: number[];
}

/**
 * Sanitize images array, ensuring featured and hero images are included
 */
export function sanitizeImages(formData: TourFormData): TourImage[] {
  const images: TourImage[] = formData.images || [];
  const hasFeatured = images.some((img) => img.imageType === "FEATURED");
  const hasHero = images.some((img) => img.imageType === "HERO");
  
  // Add featured image if not present
  if (formData.featuredImage && !hasFeatured) {
    images.push({
      imageType: "FEATURED",
      url: formData.featuredImage,
      altText: formData.name || "Featured image",
      sortOrder: 0,
    });
  }
  
  // Add hero image if not present
  if (formData.heroImage && !hasHero) {
    images.push({
      imageType: "HERO",
      url: formData.heroImage,
      altText: formData.name || "Hero image",
      sortOrder: 1,
    });
  }
  
  // Filter and ensure altText
  return images
    .filter((item) => item.imageType && item.url)
    .map((item) => ({
      ...item,
      altText: item.altText || item.url.split('/').pop() || 'Imagen',
    }));
}

/**
 * Filter quickInfoItems to remove empty items
 */
export function filterQuickInfoItems(items: QuickInfoItem[] | undefined): QuickInfoItem[] | undefined {
  if (!items) return undefined;
  return items.filter((item) => item.icon && item.label && item.value);
}

/**
 * Filter timelineItems to remove empty items
 */
export function filterTimelineItems(items: TimelineItem[] | undefined): TimelineItem[] | undefined {
  if (!items) return undefined;
  return items.filter((item) => item.timeLabel && item.title && item.description);
}

/**
 * Filter featuredInfos to remove empty items
 */
export function filterFeaturedInfos(items: FeaturedInfo[] | undefined): FeaturedInfo[] | undefined {
  if (!items) return undefined;
  return items.filter((item) => item.icon && item.title && item.description);
}

/**
 * Validate testimonials and return validation result
 */
export function validateTestimonials(items: Testimonial[] | undefined): ValidationResult {
  if (!items) {
    return { valid: true, invalidIndices: [] };
  }
  
  const invalidIndices: number[] = [];
  items.forEach((item, index) => {
    const isValid = (
      item.text && 
      item.text.trim() && 
      item.author && 
      item.author.trim() &&
      item.avatar &&
      item.avatar.trim() &&
      item.country &&
      item.country.trim()
    );
    if (!isValid) {
      invalidIndices.push(index + 1);
    }
  });
  
  return {
    valid: invalidIndices.length === 0,
    invalidIndices,
  };
}

/**
 * Filter testimonials to remove invalid items
 */
export function filterTestimonials(items: Testimonial[] | undefined): Testimonial[] | undefined {
  if (!items) return undefined;
  return items.filter((item) => {
    return (
      item.text && 
      item.text.trim() && 
      item.author && 
      item.author.trim() &&
      item.avatar &&
      item.avatar.trim() &&
      item.country &&
      item.country.trim()
    );
  });
}

/**
 * Remove empty arrays from form data
 */
export function removeEmptyArrays(data: Partial<TourFormData>): Partial<TourFormData> {
  const cleaned = { ...data };
  
  if (cleaned.images && cleaned.images.length === 0) {
    delete cleaned.images;
  }
  if (cleaned.timelineItems && cleaned.timelineItems.length === 0) {
    delete cleaned.timelineItems;
  }
  if (cleaned.featuredInfos && cleaned.featuredInfos.length === 0) {
    delete cleaned.featuredInfos;
  }
  if (cleaned.testimonials && cleaned.testimonials.length === 0) {
    delete cleaned.testimonials;
  }
  if (cleaned.quickInfoItems && cleaned.quickInfoItems.length === 0) {
    delete cleaned.quickInfoItems;
  }
  if (cleaned.prices && cleaned.prices.length === 0) {
    delete cleaned.prices;
  }
  
  return cleaned;
}
