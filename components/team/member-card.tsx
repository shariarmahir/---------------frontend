import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { departments, type TeamMember } from "@/data/team";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "./member-avatar";

const RING_LABEL = { core: "Core", inner: "Orbit 01", mid: "Orbit 02", outer: "Orbit 03" } as const;

/**
 * One card per team member — reused on /team and on each profile page's
 * "same team" row. Portrait band (placeholder until photos arrive), role,
 * short about, skill tiles and the "View profile" action.
 */
export function MemberCard({ member }: { member: TeamMember }) {
  const dept = departments[member.depts[0]];

  return (
    <article
      className="glass-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      style={{ "--card-accent": dept.color } as React.CSSProperties}
    >
      {/* Portrait band — photo placeholder. */}
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-slate-950">
        <div
          aria-hidden
          className="absolute inset-0 opacity-90 transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          style={{
            background: `radial-gradient(circle at 50% 120%, ${dept.color}cc, transparent 60%), radial-gradient(circle at 15% 10%, ${dept.color}55, transparent 45%), #0b1220`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{ backgroundImage: "radial-gradient(rgb(255 255 255 / 0.5) 1px, transparent 1px)", backgroundSize: "14px 14px" }}
        />
        {/* Signal ring behind the monogram. */}
        <span aria-hidden className="absolute size-32 rounded-full border border-white/15 transition-transform duration-700 group-hover:scale-125 motion-reduce:group-hover:scale-100" />
        <span aria-hidden className="absolute size-44 rounded-full border border-dashed border-white/10" />
        <MemberAvatar
          member={member}
          className="relative size-20 ring-4 ring-white/15 transition-transform duration-500 group-hover:scale-110 motion-reduce:group-hover:scale-100"
          textClassName="text-2xl"
        />

        <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-slate-700 uppercase shadow-sm">
          <Icon name="radio_button_checked" className="text-[12px]! text-signal-orange" />
          {RING_LABEL[member.ring]}
        </span>
        <span className="absolute right-3 bottom-3 rounded-full bg-slate-950/60 px-2.5 py-1 font-bengali text-[10px] text-white/80 backdrop-blur-sm">
          ছবি শীঘ্রই
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap gap-1.5">
          {member.depts.map((id) => {
            const d = departments[id];
            return (
              <span
                key={id}
                className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide uppercase", d.text, d.soft, d.border)}
              >
                <Icon name={d.icon} className="text-[12px]!" />
                {d.label}
              </span>
            );
          })}
        </div>

        <div>
          <h3 className="font-grotesk text-xl font-bold text-text-primary">{member.name}</h3>
          <p className={cn("mt-0.5 font-sans text-sm font-semibold", dept.text)}>
            {member.role} <span className="font-bengali font-normal text-text-muted">· {member.roleBn}</span>
          </p>
        </div>

        <p className="line-clamp-3 font-sans text-sm leading-relaxed text-text-secondary">{member.about}</p>

        {/* Skill tiles. */}
        <ul className="grid grid-cols-2 gap-2" aria-label="Skills">
          {member.skills.slice(0, 4).map((s) => (
            <li
              key={s.label}
              className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2 transition-colors group-hover:border-slate-200"
            >
              <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", dept.soft, dept.text)}>
                <Icon name={s.icon} className="text-[16px]!" />
              </span>
              <span className="truncate font-sans text-xs font-medium text-text-secondary">{s.label}</span>
            </li>
          ))}
        </ul>

        <Link
          href={`/team/${member.slug}`}
          className="mt-auto inline-flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-grotesk text-sm font-bold text-text-primary uppercase transition-all group-hover:border-transparent group-hover:bg-(--card-accent) group-hover:text-white focus-visible:ring-3 focus-visible:ring-signal-orange/50 focus-visible:outline-none"
        >
          View profile
          <span className="sr-only"> — {member.name}</span>
          <Icon name="arrow_forward" className="text-[18px]! transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </Link>
      </div>
    </article>
  );
}
