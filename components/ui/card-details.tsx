"use client";

import { createContext, useContext, useId, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const OpenContext = createContext<{ open: boolean; id: string }>({ open: false, id: "" });

/**
 * A card that opens on tap. On phones the whole card is one button and the
 * `CardDetails` inside stay folded until it is tapped; from `sm` up the
 * details are always open and the tap layer is gone. `hint` (a short line
 * such as a job title) shows only while the card is closed on a phone.
 */
export function TapCard({
  children,
  hint,
  className,
  style,
  label,
}: {
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the tap layer, e.g. the person's name. */
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <OpenContext.Provider value={{ open, id }}>
      <article style={style} className={cn("relative", className)}>
        {children}
        {hint && !open ? <div className="px-2.5 pb-3 sm:hidden">{hint}</div> : null}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          aria-label={`${label} — ${open ? "hide" : "view"} details`}
          onClick={() => setOpen((v) => !v)}
          className="absolute inset-0 z-10 rounded-[inherit] focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none sm:hidden"
        />
      </article>
    </OpenContext.Provider>
  );
}

/** The part of a `TapCard` that folds away on phones. */
export function CardDetails({ children, className }: { children: ReactNode; className?: string }) {
  const { open, id } = useContext(OpenContext);

  return (
    <div
      id={id}
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:grid-rows-[1fr]",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className={cn("min-h-0 overflow-hidden", className)}>{children}</div>
    </div>
  );
}
