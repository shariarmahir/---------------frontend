"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";

export interface Tab<T extends string> {
  id: T;
  label: React.ReactNode;
  count?: number;
}

/**
 * Tabs as a ruled strip across a band: square cells, the chosen one
 * inverted, counts in a quiet face. Arrow keys move along it, as a tab list
 * should. The panel it controls carries `id={`${idBase}-panel`}`.
 */
export function TabStrip<T extends string>({ tabs, value, onChange, label, idBase, className }: { tabs: Tab<T>[]; value: T; onChange: (id: T) => void; label: string; idBase: string; className?: string }) {
  const list = useRef<HTMLDivElement>(null);

  function key(e: React.KeyboardEvent, i: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = tabs[(i + step + tabs.length) % tabs.length];
    onChange(next.id);
    list.current?.querySelector<HTMLButtonElement>(`[data-tab="${next.id}"]`)?.focus();
  }

  return (
    <div ref={list} role="tablist" aria-label={label} className={cn("flex flex-wrap gap-px border-b border-(--c-line) bg-(--c-line)", className)}>
      {tabs.map((t, i) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            data-tab={t.id}
            id={`${idBase}-${t.id}`}
            aria-selected={on}
            aria-controls={`${idBase}-panel`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => key(e, i)}
            className={cn("hud flex h-11 items-center gap-2 px-5 font-bold transition-colors duration-150 first:pl-6 md:first:pl-10", on ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "bg-(--c-bg) text-(--c-muted) hover:text-(--c-ink-strong)")}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="font-normal opacity-60">
                <Num value={t.count} />
              </span>
            )}
          </button>
        );
      })}
      <span aria-hidden className="flex-1 bg-(--c-bg)" />
    </div>
  );
}
