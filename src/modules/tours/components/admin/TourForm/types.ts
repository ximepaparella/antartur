/**
 * Types for TourForm component
 */

export interface TourImage {
  id?: string;
  imageType: string;
  url: string;
  altText?: string;
  sortOrder?: number;
}

export interface TourPrice {
  currency: string;
  priceAdult: number;
  priceChild: number;
}

export interface QuickInfoItem {
  id?: string;
  icon: string;
  label: string;
  value: string;
  sortOrder?: number;
}

export interface TimelineItem {
  id?: string;
  timeLabel: string;
  title: string;
  description: string;
  sortOrder?: number;
}

export interface FeaturedInfo {
  id?: string;
  icon: string;
  title: string;
  description: string;
  sortOrder?: number;
}

export interface Testimonial {
  id?: string;
  text: string;
  author: string;
  avatar: string;
  country: string;
  sortOrder?: number;
}

export interface Restriction {
  id?: string;
  text: string;
  sortOrder?: number;
}

export interface TourAdditional {
  id?: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  prices?:
    | Array<{ currency: string; price: number }>
    | {
        ARS?: { adult: number; child: number };
        USD?: { adult: number; child: number };
      };
}

export interface TourFormData {
  id?: string;
  name?: string;
  slug?: string;
  subtitle?: string | null;
  category?: string;
  difficulty?: string;
  shortDescription?: string;
  longDescription?: string;
  durationHours?: number | null;
  minAge?: number | null;
  minPassengers?: number | null;
  allowsInfants?: boolean;
  restrictionText?: string | null;
  isActive?: boolean;
  mondayAvailable?: boolean;
  tuesdayAvailable?: boolean;
  wednesdayAvailable?: boolean;
  thursdayAvailable?: boolean;
  fridayAvailable?: boolean;
  saturdayAvailable?: boolean;
  sundayAvailable?: boolean;
  // SEO fields
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  // Content fields
  heroImage?: string | null;
  heroSubheadline?: string | null;
  featuredImage?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  alternativePrice?: string | null;
  alternativeText?: string | null;
  timelineImportantNote?: string | null;
  // Relations
  images?: TourImage[];
  prices?: TourPrice[];
  quickInfoItems?: QuickInfoItem[];
  timelineItems?: TimelineItem[];
  featuredInfos?: FeaturedInfo[];
  testimonials?: Testimonial[];
  restrictions?: Restriction[];
  additionals?: TourAdditional[];
  // Internal fields (not sent to API)
  departures?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}
