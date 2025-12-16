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
  // Tiempo y duración
  Timer,
  Hourglass,
  // Actividades y deportes
  Mountain,
  MountainSnow,
  Trees,
  TreePine,
  Tent,
  Compass,
  Navigation,
  Footprints,
  Bike,
  Car,
  Bus,
  Sailboat,
  Plane,
  // Naturaleza y clima
  Sun,
  Cloud,
  CloudSun,
  Snowflake,
  Thermometer,
  Wind,
  Waves,
  Droplets,
  Flame,
  Leaf,
  Flower,
  Bird,
  Fish,
  Dog,
  // Personas y grupos
  User,
  UserCheck,
  Baby,
  Accessibility,
  Heart,
  HeartHandshake,
  // Dificultad y nivel
  Gauge,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart,
  Signal,
  Zap,
  BatteryFull,
  // Comida y bebida
  Utensils,
  Coffee,
  Wine,
  Beer,
  Sandwich,
  Apple,
  // Equipamiento
  Camera,
  Backpack,
  Glasses,
  Umbrella,
  Flashlight,
  Binoculars,
  Shirt,
  Boot,
  // Información y comunicación
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Globe,
  // Dinero y pagos
  DollarSign,
  Receipt,
  Tag,
  Percent,
  // Seguridad
  Shield,
  ShieldCheck,
  Lock,
  Key,
  LifeBuoy,
  FirstAid,
  // Otros
  Star,
  Award,
  Trophy,
  Medal,
  Gift,
  Sparkles,
  Flag,
  Bookmark,
  Home,
  Building,
  Landmark,
  Parking,
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
  | "calendar-days"
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
  | "wallet"
  // Tiempo y duración
  | "timer"
  | "hourglass"
  // Actividades y deportes
  | "mountain"
  | "mountain-snow"
  | "trees"
  | "tree-pine"
  | "tent"
  | "compass"
  | "map"
  | "map-pin"
  | "navigation"
  | "footprints"
  | "bike"
  | "car"
  | "bus"
  | "sailboat"
  | "plane"
  // Naturaleza y clima
  | "sun"
  | "cloud"
  | "cloud-sun"
  | "snowflake"
  | "thermometer"
  | "wind"
  | "waves"
  | "droplets"
  | "flame"
  | "leaf"
  | "flower"
  | "bird"
  | "fish"
  | "dog"
  // Personas y grupos
  | "user"
  | "user-check"
  | "baby"
  | "accessibility"
  | "heart"
  | "heart-handshake"
  // Dificultad y nivel
  | "gauge"
  | "activity"
  | "trending-up"
  | "trending-down"
  | "bar-chart"
  | "signal"
  | "zap"
  | "battery-full"
  // Comida y bebida
  | "utensils"
  | "coffee"
  | "wine"
  | "beer"
  | "sandwich"
  | "apple"
  // Equipamiento
  | "camera"
  | "backpack"
  | "glasses"
  | "umbrella"
  | "flashlight"
  | "binoculars"
  | "shirt"
  | "boot"
  // Información y comunicación
  | "alert-triangle"
  | "check-circle"
  | "x-circle"
  | "help-circle"
  | "globe"
  // Dinero y pagos
  | "dollar-sign"
  | "receipt"
  | "tag"
  | "percent"
  // Seguridad
  | "shield"
  | "shield-check"
  | "lock"
  | "key"
  | "life-buoy"
  | "first-aid"
  // Otros
  | "star"
  | "award"
  | "trophy"
  | "medal"
  | "gift"
  | "sparkles"
  | "flag"
  | "bookmark"
  | "home"
  | "building"
  | "landmark"
  | "parking";

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
  // Tiempo y duración
  timer: Timer,
  hourglass: Hourglass,
  // Actividades y deportes
  mountain: Mountain,
  "mountain-snow": MountainSnow,
  trees: Trees,
  "tree-pine": TreePine,
  tent: Tent,
  compass: Compass,
  map: MapIcon,
  "map-pin": MapPin,
  navigation: Navigation,
  footprints: Footprints,
  bike: Bike,
  car: Car,
  bus: Bus,
  sailboat: Sailboat,
  plane: Plane,
  // Naturaleza y clima
  sun: Sun,
  cloud: Cloud,
  "cloud-sun": CloudSun,
  snowflake: Snowflake,
  thermometer: Thermometer,
  wind: Wind,
  waves: Waves,
  droplets: Droplets,
  flame: Flame,
  leaf: Leaf,
  flower: Flower,
  bird: Bird,
  fish: Fish,
  dog: Dog,
  // Personas y grupos
  user: User,
  "user-check": UserCheck,
  baby: Baby,
  accessibility: Accessibility,
  heart: Heart,
  "heart-handshake": HeartHandshake,
  // Dificultad y nivel
  gauge: Gauge,
  activity: Activity,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "bar-chart": BarChart,
  signal: Signal,
  zap: Zap,
  "battery-full": BatteryFull,
  // Comida y bebida
  utensils: Utensils,
  coffee: Coffee,
  wine: Wine,
  beer: Beer,
  sandwich: Sandwich,
  apple: Apple,
  // Equipamiento
  camera: Camera,
  backpack: Backpack,
  glasses: Glasses,
  umbrella: Umbrella,
  flashlight: Flashlight,
  binoculars: Binoculars,
  shirt: Shirt,
  boot: Boot,
  // Información y comunicación
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
  "help-circle": HelpCircle,
  globe: Globe,
  // Dinero y pagos
  "dollar-sign": DollarSign,
  receipt: Receipt,
  tag: Tag,
  percent: Percent,
  // Seguridad
  shield: Shield,
  "shield-check": ShieldCheck,
  lock: Lock,
  key: Key,
  "life-buoy": LifeBuoy,
  "first-aid": FirstAid,
  // Otros
  star: Star,
  award: Award,
  trophy: Trophy,
  medal: Medal,
  gift: Gift,
  sparkles: Sparkles,
  flag: Flag,
  bookmark: Bookmark,
  home: Home,
  building: Building,
  landmark: Landmark,
  parking: Parking,
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
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" not found in iconMap`);
    }
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

