"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Num } from "./numerals";

const labels = ["", "দুর্বল", "চলনসই", "ভালো", "খুব ভালো", "অসাধারণ"];

/** 1–5 star picker as a radio group (keyboard: arrows move, space picks). */
export function StarInput({
  value,
  onChange,
  size = 32,
  invalid,
  name,
  label = "তারা দিন",
}: {
  value: number;
  onChange: (n: number) => void;
  size?: number;
  invalid?: boolean;
  name?: string;
  /** Accessible name for the radio group. */
  label?: string;
}) {
  const [hover, setHover] = useState(0);
  const id = useId();
  const shown = hover || value;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="radiogroup" aria-label={label} aria-invalid={invalid} className="flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(n)}>
            <input
              type="radio"
              name={name ?? `${id}-stars`}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <Star
              aria-hidden
              style={{ width: size, height: size }}
              strokeWidth={1.5}
              className={cn(
                "rounded-md transition-colors duration-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bd-green",
                n <= shown ? "fill-amber-400 text-amber-400" : "text-slate-300",
              )}
            />
            <span className="sr-only">
              <Num value={n} /> তারা — {labels[n]}
            </span>
          </label>
        ))}
      </div>
      <span className="min-w-16 text-sm font-semibold text-text-secondary" aria-hidden>
        {shown ? labels[shown] : "বেছে নিন"}
      </span>
    </div>
  );
}
