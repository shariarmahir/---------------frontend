import {
  Award,
  BadgeCheck,
  BookOpenCheck,
  Briefcase,
  CalendarDays,
  Clock,
  Gauge,
  Handshake,
  KeyRound,
  Landmark,
  LayoutGrid,
  LifeBuoy,
  type LucideIcon,
  MessagesSquare,
  MonitorCog,
  PartyPopper,
  Scale,
  Settings,
  ShieldCheck,
  TriangleAlert,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { Perm } from "@/lib/hq/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown only to holders of this permission; "prime" = the super prime admin only. */
  perm?: Perm | "prime";
  /** Which badge count to show (see components/hq/shell.tsx). */
  count?: "chat" | "approvals" | "help" | "notices";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Kandari HQ's sidebar: everyone's own work first, then the company's controls by access. */
export const HQ_NAV: NavGroup[] = [
  {
    label: "My work",
    items: [
      { href: "/hq", label: "Command Center", icon: Gauge },
      { href: "/hq/taskbook", label: "My TaskBook", icon: BookOpenCheck },
      { href: "/hq/tasks", label: "Task Board", icon: LayoutGrid },
      { href: "/hq/chat", label: "Chat", icon: MessagesSquare, count: "chat" },
      { href: "/hq/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/hq/help", label: "Help Requests", icon: LifeBuoy, count: "help" },
    ],
  },
  {
    label: "Team",
    items: [
      { href: "/hq/teams", label: "Teams", icon: UsersRound },
      { href: "/hq/people", label: "People", icon: Users },
      { href: "/hq/leaderboard", label: "Ranks & Badges", icon: Award },
      { href: "/hq/wall", label: "Celebration Wall", icon: PartyPopper },
      { href: "/hq/issues", label: "Issue Board", icon: TriangleAlert },
      { href: "/hq/shongbidhan", label: "Shongbidhan", icon: Scale },
      { href: "/hq/attendance", label: "Attendance & Leave", icon: Clock },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/hq/approvals", label: "Approvals", icon: BadgeCheck, count: "approvals" },
      { href: "/hq/clients", label: "Client CRM", icon: Handshake, perm: "clients.view" },
      { href: "/hq/hr", label: "HR", icon: Briefcase, perm: "hr.manage" },
      { href: "/hq/finance", label: "Finance", icon: Wallet, perm: "finance.view" },
      { href: "/hq/reports", label: "Reports", icon: Landmark, perm: "reports.view" },
      { href: "/hq/content", label: "Website Content", icon: MonitorCog, perm: "content.manage" },
      { href: "/hq/access", label: "Access Control", icon: KeyRound, perm: "prime" },
      { href: "/hq/audit", label: "Security Log", icon: ShieldCheck, perm: "audit.view" },
      { href: "/hq/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const NAV_ALL: NavItem[] = HQ_NAV.flatMap((g) => g.items);
