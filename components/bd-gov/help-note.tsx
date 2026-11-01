"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { FOOTER } from "@/data/bd-gov";

const SEEN = "bd-guide-help-seen";

/**
 * "Need help?" as a note in the bottom-right corner: once per visit it
 * rises open on its own, with the two numbers worth knowing (333 and 999,
 * tap to call). Closed, it folds into a small navy pill that opens it
 * again. Reduced motion keeps the note but drops the rise.
 */
export function HelpNote() {
  const [open, setOpen] = useState(false);
  const { help } = FOOTER;

  useEffect(() => {
    if (sessionStorage.getItem(SEEN)) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SEEN, "1");
    }, 1800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? (
        <section
          id="gv-help-note"
          aria-labelledby="gv-help-title"
          className="w-[min(21rem,calc(100vw-2rem))] rounded-2xl bg-gv-navy p-5 text-white shadow-[0_30px_60px_-20px_rgb(11_24_73/0.7)] ring-1 ring-white/10 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-500 motion-reduce:animate-none"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id="gv-help-title" className="font-gv-serif text-[1.3rem] leading-tight font-bold">
              {help.title}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-gv-gold"
            >
              <Icon name="close" className="text-xl!" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <p className="mt-1 text-sm leading-snug text-white/70">{help.text}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {help.lines.map((l) => (
              <li key={l.tel}>
                <a
                  href={`tel:${l.tel}`}
                  className="group flex items-center gap-4 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 transition-colors hover:bg-gv-gold hover:text-gv-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gv-gold"
                >
                  <span className="min-w-14 font-gv-serif text-[1.75rem] leading-none font-bold text-gv-gold group-hover:text-gv-navy">{l.tel}</span>
                  <span className="text-[0.95rem] leading-snug">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-controls="gv-help-note"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gv-navy pr-5 pl-4 font-bold text-white shadow-[0_14px_30px_-12px_rgb(11_24_73/0.8)] ring-1 ring-white/10 transition-colors hover:bg-gv-gold hover:text-gv-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gv-navy"
      >
        <span aria-hidden className="relative grid size-7 place-items-center rounded-full bg-gv-gold text-gv-navy">
          <Icon name="call" className="text-base!" />
          {!open ? <span className="absolute inset-0 animate-ping rounded-full bg-gv-gold/60 motion-reduce:hidden" /> : null}
        </span>
        {open ? "Close help" : help.title}
      </button>
    </div>
  );
}
