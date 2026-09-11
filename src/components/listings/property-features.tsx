import {
  BatteryCharging,
  Car,
  ChefHat,
  Check,
  DoorClosed,
  Droplets,
  LayoutGrid,
  ShieldCheck,
  ShowerHead,
  Sofa,
  Trees,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ListingFeature } from "@/types/listing";

const iconMap: Record<string, LucideIcon> = {
  droplets: Droplets,
  zap: Zap,
  "battery-charging": BatteryCharging,
  "shield-check": ShieldCheck,
  "layout-grid": LayoutGrid,
  "door-closed": DoorClosed,
  "chef-hat": ChefHat,
  "shower-head": ShowerHead,
  car: Car,
  wifi: Wifi,
  sofa: Sofa,
  trees: Trees,
};

export function PropertyFeatures({ features }: { features: ListingFeature[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {features.map((feature) => {
        const Icon = iconMap[feature.icon] ?? Check;
        return (
          <li key={feature.id} className="flex items-center gap-3 text-sm">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-foreground">{feature.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
