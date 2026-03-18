/**
 * Types for Admin API Client
 * Reuses existing DTOs where possible
 */

import type { DashboardStats } from "../hooks/useDashboardStats";
import type { OrderResponse, OrderFullResponse, BookingResponse } from "@/modules/orders/api/dto/ordersDto";
import type { TourResponse, TourFullResponse } from "@/modules/tours/api/dto/toursDto";
import type { NotificationResponse } from "@/modules/notifications/api/dto/notificationsDto";
import type { UserRole } from "@prisma/client";

// Re-export existing types
export type { DashboardStats };
export type { OrderResponse, OrderFullResponse, BookingResponse };
export type { TourResponse, TourFullResponse };
export type { NotificationResponse };

// Create Tour DTOs for admin operations
export interface CreateTourDto {
  name: string;
  slug: string;
  subtitle?: string | null;
  category: string;
  difficulty: string;
  shortDescription: string;
  longDescription: string;
  durationHours?: number | null;
  minAge?: number | null;
  minPassengers?: number | null;
  restrictionText?: string | null;
  isActive?: boolean;
  mondayAvailable?: boolean;
  tuesdayAvailable?: boolean;
  wednesdayAvailable?: boolean;
  thursdayAvailable?: boolean;
  fridayAvailable?: boolean;
  saturdayAvailable?: boolean;
  sundayAvailable?: boolean;
  defaultStartTime?: string | null;
  defaultEndTime?: string | null;
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
  // Relations (optional arrays)
  images?: Array<{
    imageType: string;
    url: string;
    altText?: string;
    sortOrder?: number;
  }>;
  prices?: Array<{
    currency: string;
    priceAdult: number;
    priceChild: number;
  }>;
  quickInfoItems?: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
  timelineItems?: Array<{
    timeLabel: string;
    title: string;
    description: string;
  }>;
  featuredInfos?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  testimonials?: Array<{
    text: string;
    author: string;
    avatar: string;
    country: string;
  }>;
  restrictions?: Array<{
    text: string;
    sortOrder?: number;
  }>;
  additionals?: Array<{
    id?: string; // Para updates, omitir para crear nuevos
    name: string;
    description?: string | null;
    isActive?: boolean;
    sortOrder?: number;
    prices?: Array<{
      currency: string;
      price: number; // Precio general (no por pasajero)
    }>;
  }>;
}

export type UpdateTourDto = Partial<CreateTourDto>;

// =============================
// Admin Users (ABM)
// =============================

export interface UserSummary {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  name?: string | null;
  role?: UserRole;
  password: string;
  confirmPassword: string;
  isActive?: boolean;
}

export interface ChangeUserPasswordDto {
  newPassword: string;
  confirmNewPassword: string;
}
