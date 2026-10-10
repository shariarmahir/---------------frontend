import { cn } from "@/lib/utils";

/** The profile's one panel: a frosted card on the dark ground, a hairline edge, no glow. */
export const glass = "rounded-3xl border border-m-ink/10 bg-m-card/80 backdrop-blur-xl shadow-m-tile";

/** A profile section: a small label, a bold title, and an action at the end, like the reference's "ABOUT ME / Designing with…". */
export function ProfileSection({
  id,
  eyebrow,
  title,
  action,
  className,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn(glass, "story-reveal scroll-mt-24 p-5 sm:p-7", className)}>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-wide text-m-blue uppercase">{eyebrow}</p>
          <h2 id={id ? `${id}-title` : undefined} className="mt-1 text-xl font-bold text-m-ink sm:text-2xl">
            {title}
          </h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
