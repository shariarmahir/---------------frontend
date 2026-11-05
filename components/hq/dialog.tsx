"use client";

import { X } from "lucide-react";
import { Dialog as D } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * HQ's dialog: a navy sheet on a dimmed black page, gold title, focus kept
 * inside, Escape and the × close it. `side` turns it into a drawer from
 * the right (task windows, details), full-height on every screen.
 */
export function HqDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  side,
  trigger,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  side?: boolean;
  trigger?: ReactNode;
}) {
  const width = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl", xl: "sm:max-w-5xl" }[size];
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <D.Trigger asChild>{trigger}</D.Trigger> : null}
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-[80] bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <D.Content
          className={cn(
            "hq fixed z-[81] flex flex-col bg-bdnavy-900 text-white shadow-2xl ring-1 ring-white/15 focus:outline-none",
            side
              ? cn("inset-y-0 right-0 w-full data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right", width)
              : cn("inset-x-3 top-[6vh] max-h-[88vh] rounded-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", width),
          )}
        >
          <header className="flex items-start gap-3 border-b border-white/10 px-5 py-4">
            <div className="min-w-0 flex-1">
              <D.Title className="font-grotesk text-lg font-bold text-signal-orange">{title}</D.Title>
              {description ? <D.Description className="mt-1 text-sm text-white/65">{description}</D.Description> : <D.Description className="sr-only">{typeof title === "string" ? title : ""}</D.Description>}
            </div>
            <D.Close aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-xl text-white/75 ring-1 ring-white/15 hover:bg-white/10 hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
              <X className="size-5" aria-hidden />
            </D.Close>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer ? <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 px-5 py-4">{footer}</footer> : null}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export const DialogClose = D.Close;
