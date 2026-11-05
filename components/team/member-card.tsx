import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { glowStyle, LIFT } from "@/components/ui/surfaces";
import { departments, toneOf, type TeamMember } from "@/data/team";
import { cn } from "@/lib/utils";

/**
 * One card per team member, in the landing page's language: a cobalt, navy
 * or ink field by department, the portrait in its own frame with the role
 * on a gold pill over its foot, then name, Bangla role, a short about and
 * the skills. The whole card opens the profile. Members without a portrait
 * get a gold monogram on the contrasting field, labelled as such.
 * Reused on /team and on each profile's "same team" row.
 */
export function MemberCard({ member, priority }: { member: TeamMember; priority?: boolean }) {
  const tone = toneOf(member);

  return (
    <Link
      href={`/team/${member.slug}`}
      aria-label={`${member.name}, ${member.role}: view profile`}
      style={glowStyle(tone.color)}
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden rounded-2xl p-1.5 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none sm:rounded-3xl sm:p-2",
        LIFT,
        tone.surface,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-2xl">
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
          <div className={cn("absolute inset-0 grid place-items-center", tone.plate)}>
            <span className="font-grotesk text-5xl leading-none font-bold transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 motion-reduce:transition-none sm:text-7xl">
              {member.initials}
            </span>
            <span className="absolute top-2 right-2 rounded-full bg-black px-2 py-0.5 font-sans text-xs text-white/80 sm:top-3 sm:right-3">Photo soon</span>
          </div>
        )}
        <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-signal-orange px-2.5 py-0.5 font-sans text-xs font-bold text-text-primary sm:bottom-3 sm:left-3 sm:px-3 sm:py-1">
          {member.role}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-2 pt-3 pb-2 sm:px-4 sm:pt-5 sm:pb-4">
        <h3 className="font-grotesk text-base leading-tight font-bold text-white transition-colors group-hover:text-signal-orange sm:text-xl">{member.name}</h3>
        <p className="mt-1 font-bengali text-xs text-white/75 sm:text-sm">{member.roleBn}</p>

        <p className="mt-3 line-clamp-3 font-sans text-sm leading-relaxed text-white/80 max-sm:hidden">{member.about}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5 max-sm:hidden" aria-label="Skills">
          {member.skills.slice(0, 3).map((s) => (
            <li key={s.label} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-semibold text-white/90 ring-1 ring-white/20 ring-inset">
              <Icon name={s.icon} className="text-sm! text-signal-orange" />
              {s.label}
            </li>
          ))}
        </ul>

        <p className="mt-auto flex items-center gap-1.5 pt-3 font-sans text-xs font-semibold text-white/75 sm:pt-5 sm:text-sm">
          <Icon name={departments[member.depts[0]].icon} className="text-base! text-signal-orange" />
          <span className="truncate">{member.depts.map((d) => departments[d].label).join(" · ")}</span>
        </p>
      </div>
    </Link>
  );
}
