import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { DeptIcon } from "../departments/dept-icons";
import { Tx } from "../../ui/language";
import { Band } from "./band";
import { toneStyle } from "./tones";

export interface StripItem {
  id: string;
  /** Where the icon jumps to on the page. */
  href: string;
  name: string;
  dept: string;
  school: ComponentProps<typeof DeptIcon>["school"];
  tone: number;
}

/**
 * The row of category icons under a catalogue page's opening: one single line
 * that drifts left on its own, rests under the pointer, and is a plain
 * scrollable row for those who prefer no motion. Each half carries its own
 * trailing gap, so the loop has no seam.
 */
export function CategoryStrip({ label, items }: { label: string; items: StripItem[] }) {
  return (
    <Band id="strip">
      <nav aria-label={label} className="academy-strip py-8">
        <div className="academy-strip-track">
          {[false, true].map((copy) => (
            <ul key={String(copy)} aria-hidden={copy || undefined} className={cn("flex shrink-0 gap-x-5 pr-5", copy && "academy-strip-copy")}>
              {items.map((it) => (
                <li key={it.id} style={toneStyle(it.tone)} className="tone">
                  <a href={it.href} tabIndex={copy ? -1 : undefined} className="group flex w-20 flex-col items-center gap-2">
                    <span className="grid size-16 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none">
                      <DeptIcon dept={it.dept} school={it.school} className="size-10" />
                    </span>
                    <span className="line-clamp-2 text-center text-xs leading-snug font-medium text-(--c-muted) transition-colors group-hover:text-(--c-app-ink)">
                      <Tx k={it.name} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </nav>
    </Band>
  );
}
