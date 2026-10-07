"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bell, BellOff, BellRing, Check, ChevronDown, UserMinus, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { teacherFollowers } from "@/data/media/academy";
import { BELLS, type Bell as BellKind } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { updateAcademy, useAcademy } from "../use-academy";

const BELL_ICON: Record<BellKind, LucideIcon> = { all: BellRing, free: Bell, none: BellOff };

/** Whether the viewer follows a teacher, and how loudly; undefined until the saved state is read. */
export function useFollow(handle: string) {
  const hydrated = useHydrated();
  const bell = useAcademy((a) => a.follows[handle]);
  const set = (next: BellKind | null) =>
    updateAcademy((a) => {
      const follows = { ...a.follows };
      if (next) follows[handle] = next;
      else delete follows[handle];
      return { ...a, follows };
    });
  return { bell: hydrated ? bell : undefined, set };
}

/** The follower count with the viewer in it. */
export function useFollowers(handle: string): number {
  const { bell } = useFollow(handle);
  return teacherFollowers(handle) + (bell ? 1 : 0);
}

/**
 * Follow a teacher. Once following, the pill turns grey with a bell, and a
 * menu sets what to hear about — every class, only the weekly free one, or
 * nothing — or stops following.
 */
export function FollowButton({ handle, name, size = "md", className }: { handle: string; name: string; size?: "sm" | "md"; className?: string }) {
  const reduce = useReducedMotion();
  const { bell, set } = useFollow(handle);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const h = size === "sm" ? "h-9 px-3.5 text-sm" : "h-10 px-4 text-sm";

  if (!bell) {
    return (
      <button
        type="button"
        onClick={() => {
          set("free");
          toast.success(`${name}-কে অনুসরণ করছেন`, { description: "প্রতি সপ্তাহের বিনামূল্যের ক্লাস এলে জানাব। ঘণ্টায় চাপ দিয়ে বদলাতে পারেন।" });
        }}
        className={mediaButton({ className: cn("rounded-full", h, className) })}
      >
        অনুসরণ করুন
      </button>
    );
  }

  const Icon = BELL_ICON[bell];
  const item = "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-m-ink hover:bg-m-ink/6 focus-visible:bg-m-ink/6 focus-visible:outline-none";
  return (
    <div ref={box} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn("inline-flex items-center gap-2 rounded-full bg-m-ink/6 font-semibold text-m-ink transition-colors hover:bg-m-ink/11 aria-expanded:bg-m-ink/11", h)}
      >
        <motion.span
          key={bell}
          className="inline-grid"
          animate={reduce ? undefined : { rotate: [0, -18, 14, -10, 6, 0] }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ transformOrigin: "50% 10%" }}
        >
          <Icon className="size-4.5" aria-hidden />
        </motion.span>
        অনুসরণ করছেন
        <ChevronDown className="size-4" aria-hidden />
        <span className="sr-only">— কী জানাব, বদলান</span>
      </button>
      {open && (
        <div role="menu" aria-label="কী জানাব" className="absolute top-12 left-0 z-30 w-60 overflow-hidden rounded-xl bg-m-card py-2 shadow-[0_20px_40px_-12px_rgb(16_24_40/0.27)] ring-1 ring-m-ink/10">
          {(Object.keys(BELLS) as BellKind[]).map((b) => {
            const BIcon = BELL_ICON[b];
            return (
              <button
                key={b}
                type="button"
                role="menuitemradio"
                aria-checked={bell === b}
                onClick={() => {
                  set(b);
                  setOpen(false);
                }}
                className={item}
              >
                <BIcon className="size-4.5" aria-hidden />
                <span className="flex-1">{BELLS[b]}</span>
                {bell === b && <Check className="size-4 text-m-blue" aria-hidden />}
              </button>
            );
          })}
          <span className="my-1 block h-px bg-m-ink/6" aria-hidden />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              set(null);
              setOpen(false);
              toast(`${name}-কে আর অনুসরণ করছেন না`);
            }}
            className={item}
          >
            <UserMinus className="size-4.5" aria-hidden /> অনুসরণ বাদ দিন
          </button>
        </div>
      )}
    </div>
  );
}
