import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Person, Tone } from "@/data/media/types";
import { cn } from "@/lib/utils";
import { IdSeal } from "./trust";

export const toneClass: Record<Tone, string> = {
  green: "bg-bd-green text-white",
  orange: "bg-signal-orange text-text-primary",
  emerald: "bg-emerald-700 text-white",
  amber: "bg-signal-orange text-text-primary",
  slate: "bg-slate-700 text-white",
  teal: "bg-teal-700 text-white",
};

const sizeClass = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-24 text-3xl",
} as const;

type AvatarPerson = Pick<Person, "initials" | "tone" | "nameBn">;

export function PersonAvatar({ person, size = "md", className }: { person: AvatarPerson; size?: keyof typeof sizeClass; className?: string }) {
  return (
    <Avatar className={cn(sizeClass[size], className)}>
      <AvatarFallback className={cn("font-bengali font-semibold", toneClass[person.tone])}>{person.initials}</AvatarFallback>
    </Avatar>
  );
}

/** Avatar, name with ID seal, and an optional second line — links to the profile. */
export function PersonLine({
  person,
  size = "md",
  meta,
  className,
}: {
  person: Person;
  size?: keyof typeof sizeClass;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={`/media/u/${person.handle}`}
      className={cn("group flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange", className)}
    >
      <PersonAvatar person={person} size={size} />
      <span className="min-w-0">
        <span className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold text-white group-hover:text-signal-orange">{person.nameBn}</span>
          {person.idVerified && <IdSeal size={16} />}
        </span>
        {meta && <span className="block truncate text-xs text-white/65">{meta}</span>}
      </span>
    </Link>
  );
}
