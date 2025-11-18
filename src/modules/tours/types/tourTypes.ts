/**
 * Tipos TypeScript para la estructura completa de tours
 */

export interface TourCardData {
  id: string;
  featuredImage: string;
  subtitle: string;
  title: string;
  difficulty: string;
  price?: string; // Para compatibilidad con datos existentes
  adultPrice?: string;
  childPrice?: string;
  category: "winter" | "summer";
}

export interface TourHero {
  headline: string;
  subheadline?: string;
  backgroundImage: string;
}

export interface QuickInfoItem {
  id: string;
  label: string;
  value: string;
  icon: "clock" | "difficulty" | "family" | "users" | "calendar" | "location";
}

export interface TourQuickInfo {
  price: string;
  items: QuickInfoItem[];
  restriction?: string;
  alternative?: {
    text: string;
    price: string;
  };
  ctaLabel: string;
  ctaHref: string;
}

export interface TourDescription {
  short: string;
  long: string[];
}

export interface FeaturedInfoItem {
  id: string;
  icon: "clock" | "difficulty" | "family" | "users" | "calendar" | "location" | "check" | "info";
  title: string;
  description: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export interface TimelineItem {
  id: string;
  timeLabel: string;
  title: string;
  description: string;
}

// Testimonial usa el mismo formato que el componente Testimonials
export interface Testimonial {
  id: string;
  text: string;
  author: string;
  avatar: string;
  country: string;
}

export interface Tour {
  // Datos básicos para la card
  card: TourCardData;
  
  // Hero del tour
  hero: TourHero;
  
  // QuickInfo (precio, items, CTA)
  quickInfo: TourQuickInfo;
  
  // Descripción del tour
  description: TourDescription;
  
  // Información destacada
  featuredInfo?: FeaturedInfoItem[];
  
  // Galería de imágenes
  gallery: GalleryImage[];
  
  // Timeline/Itinerario
  timeline: {
    items: TimelineItem[];
    importantNote?: string;
  };
  
  // Testimonios
  testimonials?: Testimonial[];
  
  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    ogImage: string;
  };
  
  // Booking (opcional)
  booking?: {
    pricing: {
      priceAdult: number;
      priceChild: number;
    };
    availability: Array<{
      date: string; // YYYY-MM-DD
      available: number;
      timeSlot: {
        start: string; // HH:mm
        end: string; // HH:mm
      };
    }>;
  };
}

