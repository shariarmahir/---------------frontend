"use client";

import type { NavIcon } from "@/data/media/nav";
import { navIcons } from "./nav";

/** A nav item's icon, for server pages that list sections. */
export function ExploreIcon({ icon }: { icon: NavIcon }) {
  const Icon = navIcons[icon];
  return <Icon className="size-5" aria-hidden />;
}
