import {
  Armchair, Baby, Bike, Building2, DraftingCompass, Factory, GraduationCap, HardHat, HeartPulse, Hourglass, Lamp, Landmark,
  Mic, Package, Palette, PartyPopper, PawPrint, Shirt, ShoppingBasket, Smartphone, Tractor, Trophy, Wrench, type LucideIcon,
} from "lucide-react";
import type { SectionIcon as Key } from "@/data/media/market-sections";

const ICONS: Record<Key, LucideIcon> = {
  food: ShoppingBasket, farm: Tractor, perform: Mic, creative: Palette, design: DraftingCompass, services: Wrench,
  education: GraduationCap, fashion: Shirt, home: Lamp, furniture: Armchair, electronics: Smartphone, vehicles: Bike,
  health: HeartPulse, kids: Baby, pets: PawPrint, sports: Trophy, antique: Hourglass, heritage: Landmark, industry: Factory,
  build: HardHat, property: Building2, festival: PartyPopper, other: Package,
};

export function SectionIcon({ icon, className }: { icon: Key; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} aria-hidden />;
}
