"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/** A plain modal, closed by Escape, the backdrop or its button. Focus goes in, stays in, and returns where it came from. */
export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea');
      if (!items.length) return;
      const [first, last] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      before?.focus();
    };
  }, [onClose]);

  return (
    <div role="presentation" onClick={onClose} className="fixed inset-0 z-60 flex items-end justify-center bg-ml-navy/70 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="ml-pop flex max-h-[88svh] w-full max-w-2xl flex-col gap-5 overflow-y-auto rounded-3xl bg-white p-6 text-ml-ink shadow-[0_32px_64px_-20px_rgb(11_24_73/0.6)] outline-none sm:p-9"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-ml-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] tracking-[0.01em] uppercase">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-full bg-ml-ground transition-colors hover:bg-signal-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy">
            <Icon name="close" className="text-2xl" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
