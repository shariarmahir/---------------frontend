"use client";

import { createContext, useContext, useId, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const OpenContext = createContext<{ open: boolean; id: string }>({ open: false, id: "" });

/**
 * A card that opens on tap. On phones the whole card is one button and the
 * `CardDetails` inside stay folded until it is tapped; from `sm` up the
 * details are always open and the tap layer is gone. `hint` (a short line
 * such as a job title) shows only while the card is closed on a phone;
 * `hintClassName` sets its padding to match the card's own.
 */
export function TapCard({
  children,
  hint,
  hintClassName,
  className,
  style,
  label,
}: {
  children: ReactNode;
  hint?: ReactNode;
  hintClassName?: string;
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
        {hint && !open ? <div className={cn("px-2.5 pb-3 sm:hidden", hintClassName)}>{hint}</div> : null}
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

/** The part of a `TapCard` that folds away on phones. `grow`: fill the rest of a column card (from `sm`). */
export function CardDetails({ children, className, grow }: { children: ReactNode; className?: string; grow?: boolean }) {
  const { open, id } = useContext(OpenContext);

  return (
    <div
      id={id}
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:grid-rows-[1fr]",
        grow && "sm:flex-1",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className={cn("min-h-0 overflow-hidden", className)}>{children}</div>
    </div>
  );
}

/** A small chevron inside a `TapCard` that shows a phone the card opens, turning over once it has (decorative; the tap layer carries the state). */
export function TapCue({ className }: { className?: string }) {
  const { open } = useContext(OpenContext);
  return (
    <Icon
      name="expand_more"
      className={cn(
        "text-2xl! transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:hidden!",
        open && "rotate-180",
        className,
      )}
    />
  );
}

/**
 * Long body text that a phone shows clamped to three lines, with "Read more"
 * to open the rest (and "Show less" to fold it again); from `sm` up it is
 * always whole and the button is gone.
 * Phrasing content only, so it can sit inside a `<p>`.
 */
export function ClampText({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <>
      <span id={id} className={cn("sm:inline", open ? "block" : "line-clamp-3")}>
        {children}
      </span>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="-my-1 inline-flex min-h-11 items-center gap-0.5 rounded-lg font-grotesk text-sm font-bold text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none sm:hidden"
      >
        {open ? "Show less" : "Read more"}
        <Icon name="expand_more" className={cn("text-xl! transition-transform duration-300 motion-reduce:transition-none", open && "rotate-180")} />
      </button>
    </>
  );
}
