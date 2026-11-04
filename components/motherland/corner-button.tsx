"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { pill } from "./kit";

/** A page's one corner action. The hero holds its title alone, so this waits until the hero has gone by. */
export function CornerButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const check = () => setShown(window.scrollY > window.innerHeight * 0.7);
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  if (!shown) return null;
  return (
    <button type="button" onClick={onClick} className={cn(pill.onLight, "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 shadow-[0_12px_28px_-8px_rgb(11_24_73/0.55)] sm:right-8 sm:bottom-8")}>
      {children}
    </button>
  );
}
