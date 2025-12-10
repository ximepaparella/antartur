// Types para componentes admin de tours

export interface TourFormProps {
  tour: any;
  isEditing: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export type TabType = "basic" | "grid" | "images" | "content" | "availability";

export interface TourPreviewProps {
  tourData: any;
}

// Types para AvailabilityManager
export interface Departure {
  id: string;
  date?: string; // YYYY-MM-DD (from API)
  departureDate?: string; // Legacy support
  startTime: string;
  endTime?: string | null;
  seatsTotal: number;
  seatsHeld: number;
  seatsConfirmed: number;
  isActive: boolean;
}

export interface AvailabilityManagerProps {
  tourId: string;
  disabled?: boolean;
  tourWeekdays?: {
    mondayAvailable: boolean;
    tuesdayAvailable: boolean;
    wednesdayAvailable: boolean;
    thursdayAvailable: boolean;
    fridayAvailable: boolean;
    saturdayAvailable: boolean;
    sundayAvailable: boolean;
  };
}

// Types para ImagePicker
export interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  tourSlug: string;
  imageType: "featured" | "hero" | "gallery";
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}

// Types para IconPicker
export interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}

// Types para GalleryManager
export interface GalleryImage {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
  imageType: string;
}

export interface GalleryManagerProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  tourSlug: string;
  disabled?: boolean;
}

