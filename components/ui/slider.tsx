"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/** shadcn/ui Slider, written against the vendored Radix primitive. */
function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = value ?? defaultValue ?? [min];
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn("relative flex w-full touch-none items-center select-none data-disabled:opacity-50", className)}
      {...props}
    >
      <SliderPrimitive.Track data-slot="slider-track" className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200">
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-signal-orange" />
      </SliderPrimitive.Track>
      {values.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          className="block size-6 rounded-full border-2 border-signal-orange bg-white shadow-[0_1px_3px_rgb(15_23_42/0.25)] transition-[box-shadow] hover:ring-4 hover:ring-signal-orange/20 focus-visible:ring-4 focus-visible:ring-signal-orange/35 focus-visible:outline-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
