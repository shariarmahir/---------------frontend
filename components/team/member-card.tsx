import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PixelMark } from "@/components/ui/section-kit";
import { departments, toneOf, type DeptId, type TeamMember } from "@/data/team";
import { glowStyle } from "@/components/ui/surfaces";
import { cn } from "@/lib/utils";

/** The fade at the portrait's foot runs into the card's own colour. */
const FADE: Record<DeptId, string> = {
  leadership: "to-signal-orange",
  creative: "to-bdorange-600",
  client: "to-text-primary",
  iot: "to-bd-green",
  dev: "to-bdgreen-500",
};

/** Lift and glow on hover and on touch press — the home poster cards' motion. */
const POSTER_LIFT =
  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_28px_48px_-22px_var(--glow)] active:-translate-y-2 active:shadow-[0_28px_48px_-22px_var(--glow)] active:scale-[0.98] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 motion-reduce:active:scale-100";

/**
 * One poster card per team member, in the home page's leadership language:
 * a solid colour field, the portrait bleeding off the top and fading into
 * the colour, the role on a solid pill, then name, a short about and the
 * skills. The whole card opens the profile. Members without a portrait get
 * a monogram plate on the contrasting colour, labelled "photo coming".
 * Reused on /team and on each profile's "same team" row.
 */
export function MemberCard({ member, priority }: { member: TeamMember; priority?: boolean }) {
  const tone = toneOf(member);
  const toneId = member.tone ?? member.depts[0];

  return (
    <Link
      href={`/team/${member.slug}`}
      aria-label={`${member.name}, ${member.role} — view profile`}
      style={glowStyle(tone.color)}
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none sm:rounded-3xl",
        POSTER_LIFT,
        tone.surface,
      )}
    >
      {/* Portrait, fading into the card colour at its foot. */}
      <div className="relative aspect-square w-full overflow-hidden">
        {member.photo ? (
          <Image
            src={member.photo}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 400px, (min-width: 640px) 33vw, 50vw"
            quality={90}
            className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-3", tone.plate)}>
            <span className="font-grotesk text-6xl leading-none font-bold transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 motion-reduce:transition-none sm:text-8xl">
              {member.initials}
            </span>
            <PixelMark tone={tone.plate.includes("bg-signal-orange") ? "light" : "dark"} />
            <span className="absolute top-2.5 right-2.5 rounded-full bg-black/35 px-2 py-0.5 font-bengali text-[10px] text-white sm:top-3 sm:right-3">ছবি শীঘ্রই</span>
          </div>
        )}
        <div aria-hidden className={cn("absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-transparent", FADE[toneId])} />
      </div>

      <div className="relative -mt-5 flex flex-1 flex-col px-3 pb-4 sm:-mt-8 sm:px-6 sm:pb-6">
        <span className={cn("mb-2 w-fit rounded-full px-2 py-0.5 font-mono text-[9px] leading-tight font-bold uppercase sm:mb-3 sm:px-3 sm:py-1 sm:text-[11px]", tone.tile)}>
          {member.role}
        </span>
        <h3 className="font-grotesk text-[0.95rem] leading-tight font-bold sm:text-xl">{member.name}</h3>
        <p className="mt-1 font-bengali text-[11px] opacity-85 sm:text-sm">{member.roleBn}</p>

        <p className="mt-3 line-clamp-3 font-sans text-sm leading-relaxed max-sm:hidden">{member.about}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5 max-sm:hidden" aria-label="Skills">
          {member.skills.slice(0, 3).map((s) => (
            <li key={s.label} className="inline-flex items-center gap-1.5 rounded-full bg-black/15 px-2.5 py-1 font-sans text-xs font-semibold">
              <Icon name={s.icon} className="text-[14px]!" />
              {s.label}
            </li>
          ))}
        </ul>

        <span className="mt-auto flex items-center justify-between gap-2 pt-4 font-grotesk text-[11px] font-bold uppercase sm:pt-5 sm:text-sm">
          <span className="flex items-center gap-1.5 truncate">
            <Icon name={departments[member.depts[0]].icon} className="text-[16px]!" />
            <span className="truncate">{member.depts.map((d) => departments[d].label).join(" · ")}</span>
          </span>
          <Icon name="arrow_forward" className="shrink-0 text-[18px]! transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </Link>
  );
}
