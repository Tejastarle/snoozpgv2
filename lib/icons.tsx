import {
  BedDouble,
  Building2,
  Clock,
  Coffee,
  Droplets,
  GlassWater,
  ShowerHead,
  Lock,
  MapPin,
  Plane,
  Plug,
  Route,
  ShieldCheck,
  Snowflake,
  Sparkles,
  SprayCan,
  Sun,
  TrainFront,
  Waves,
  Wifi,
  Wind,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  clock: Clock,
  snowflake: Snowflake,
  wifi: Wifi,
  waves: Waves,
  "map-pin": MapPin,
  train: TrainFront,
  spray: SprayCan,
  shield: ShieldCheck,
  plane: Plane,
  route: Route,
  bed: BedDouble,
  building: Building2,
  lock: Lock,
  plug: Plug,
  wind: Wind,
  sun: Sun,
  coffee: Coffee,
  droplets: Droplets,
  glass: GlassWater,
  shower: ShowerHead,
  sparkles: Sparkles,
};

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, className, strokeWidth = 1.4 }: { name: string; className?: string; strokeWidth?: number }) {
  const C = ICONS[name] ?? Sparkles;
  return <C className={className} strokeWidth={strokeWidth} aria-hidden />;
}
