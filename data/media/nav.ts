/** Navigation for শিক্ষিতদের মিডিয়া. Icons are resolved in the shell. */
export type NavIcon = "feed" | "market" | "messages" | "wallet" | "profile" | "create";

export interface MediaNavItem {
  href: string;
  label: string;
  icon: NavIcon;
  badge?: "messages";
}

export const mediaNav: MediaNavItem[] = [
  { href: "/media", label: "ফিড", icon: "feed" },
  { href: "/media/market", label: "বাজার", icon: "market" },
  { href: "/media/messages", label: "বার্তা", icon: "messages", badge: "messages" },
  { href: "/media/wallet", label: "ওয়ালেট", icon: "wallet" },
  { href: "/media/me", label: "প্রোফাইল", icon: "profile" },
];

/** Phone bottom bar; the centre item creates a post. */
export const mediaTabs: MediaNavItem[] = [
  { href: "/media", label: "ফিড", icon: "feed" },
  { href: "/media/market", label: "বাজার", icon: "market" },
  { href: "/media/post/new", label: "পোস্ট", icon: "create" },
  { href: "/media/messages", label: "বার্তা", icon: "messages", badge: "messages" },
  { href: "/media/me", label: "আমি", icon: "profile" },
];
