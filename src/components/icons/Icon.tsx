import type { FC, SVGProps } from "react";
import {
  Instagram,
  Facebook,
  ShoppingBag,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  FileText,
  Info,
  ChevronDown,
  Map as MapIcon,
  Check,
  Calendar,
  Users,
  CreditCard,
  Clock,
  AlertCircle,
  UtensilsCrossed,
  CarFront,
  Ship,
  MessageCircle,
  BookA,
  ChevronLeft,
  ChevronRight,
  Building2,
  Wallet,
  ChevronUp,
} from "lucide-react";

/**
 * Iconos soportados por el componente Icon
 * Mapeados desde nombres semánticos a componentes de Lucide React
 */
export type IconName =
  | "phone"
  | "email"
  | "document"
  | "info"
  | "location"
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "menu"
  | "close"
  | "bag"
  | "chevron-down"
  | "map-route"
  | "check"
  | "calendar"
  | "users"
  | "credit-card"
  | "clock"
  | "difficulty"
  | "alert-circle"
  | "family"
  | "lunch"
  | "off-road"
  | "kayak"
  | "book-a"
  | "chevron-left"
  | "chevron-right"
  | "chevron-up"
  | "bank"
  | "wallet";

export type IconProps = {
  /** Nombre del icono a mostrar */
  name: IconName;
  /** Clase CSS adicional */
  className?: string;
  /** Título del icono (para accesibilidad) */
  title?: string;
  /** Tamaño del icono en píxeles (por defecto 20) */
  size?: number;
  /** Label para accesibilidad (alternativa a title) */
  ariaLabel?: string;
} & Omit<SVGProps<SVGSVGElement>, "name" | "width" | "height" | "title" | "aria-label" | "aria-hidden" | "role">;

/**
 * Mapa de nombres de iconos a componentes de Lucide
 */
const iconMap: Record<IconName, FC<SVGProps<SVGSVGElement>>> = {
  phone: Phone,
  email: Mail,
  document: FileText,
  info: Info,
  location: MapPin,
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  menu: Menu,
  close: X,
  bag: ShoppingBag,
  "chevron-down": ChevronDown,
  "map-route": MapIcon,
  check: Check,
  calendar: Calendar,
  users: Users,
  "credit-card": CreditCard,
  clock: Clock,
  difficulty: AlertCircle,
  "alert-circle": AlertCircle,
  family: Users,
  lunch: UtensilsCrossed,
  "off-road": CarFront,
  kayak: Ship,
  "book-a": BookA,
  "calendar-days": Calendar,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "bank": Building2,
  "wallet": Wallet,
};

/**
 * Componente Icon wrapper para Lucide React
 * 
 * Proporciona una API consistente y tipada para usar iconos SVG
 * basados en Lucide React. Los iconos usan currentColor por defecto
 * y pueden ser estilizados mediante CSS.
 * 
 * @example
 * ```tsx
 * <Icon name="facebook" size={24} className={styles.icon} />
 * <Icon name="menu" size={20} ariaLabel="Abrir menú" />
 * ```
 */
export const Icon: FC<IconProps> = ({
  name,
  className = "",
  title,
  size = 20,
  ariaLabel,
  ...rest
}) => {
  const Component = iconMap[name];

  if (!Component) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  const hasAriaLabel = ariaLabel !== undefined || title !== undefined;

  // Remove title from rest to avoid passing it to SVG element
  const { title: _, ...svgProps } = rest as any;

  return (
    <Component
      className={className}
      width={size}
      height={size}
      strokeWidth={1.5}
      aria-hidden={hasAriaLabel ? undefined : true}
      role={hasAriaLabel ? "img" : undefined}
      aria-label={ariaLabel || title}
      {...svgProps}
    />
  );
};

