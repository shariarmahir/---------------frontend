"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalogue } from "./catalogue-root";

/**
 * The catalogue's dialog, after the reference's: the page dims to black,
 * the panel rises a few pixels and grows from 95% in 200 ms, and Escape, the
 * dim or the square close button puts it away. The page stops gliding
 * underneath while it is open. It is portalled to the body but wears the
 * page's skin, so it keeps the theme and faces.
 */
export function Modal({ open, onClose, label, className, children }: { open: boolean; onClose: () => void; label: string; className?: string; children: React.ReactNode }) {
  const { skin, theme, glide } = useCatalogue();
  const [shown, setShown] = useState(false);

  // Mount first, then flip to the shown state two frames later so the rise plays.
  useEffect(() => {
    if (!open) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      setShown(false);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    const page = glide.current;
    page?.stop();
    return () => {
      window.removeEventListener("keydown", esc);
      page?.start();
    };
  }, [open, onClose, glide]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div data-theme={theme} className={cn(skin, "fixed inset-0 z-70")} style={{ background: "transparent" }}>
      <div aria-hidden onClick={onClose} className={cn("fixed inset-0 bg-black/70 transition-opacity duration-200", shown ? "opacity-100" : "opacity-0")} />
      <div className="pointer-events-none flex min-h-full items-center justify-center p-0 sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={cn(
            "pointer-events-auto relative w-full max-w-lg border border-(--c-line) bg-(--c-bg-raised) text-(--c-ink) transition-[opacity,transform] duration-200",
            shown ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2.5 scale-95 opacity-0",
            className,
          )}
        >
          {children}
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="absolute top-2.5 right-2.5 grid size-9 place-items-center bg-(--c-bg)/70 text-(--c-ink) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
          >
            <X className="size-5" aria-hidden />
            <span className="sr-only">বন্ধ করুন</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
