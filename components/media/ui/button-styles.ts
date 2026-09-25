import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button looks for শিক্ষিতদের মিডিয়া, for <button> and <Link> alike.
 *
 * Buttons never move: hover and press change colour, border and shadow
 * only. Primary is orange with near-black text (white on #FF9100 is ~2:1).
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-bd-green/35 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-signal-orange text-text-primary shadow-[0_1px_2px_rgb(154_52_18/0.25)] hover:brightness-95 active:brightness-90",
        green: "border-transparent bg-bd-green text-white shadow-[0_1px_2px_rgb(0_71_49/0.3)] hover:bg-bd-green-dark",
        outline: "border-bd-green/30 bg-white text-bd-green hover:border-bd-green hover:bg-bd-green-light",
        quiet: "border-card-border bg-white text-text-primary hover:border-slate-300 hover:bg-slate-50",
        ghost: "border-transparent bg-transparent text-text-secondary hover:bg-slate-100 hover:text-text-primary",
        danger: "border-red-200 bg-white text-national-crimson hover:border-red-300 hover:bg-red-50",
      },
      size: {
        sm: "h-9 px-3 text-sm [&_svg]:size-4",
        md: "h-11 px-4 text-sm [&_svg]:size-[18px]",
        lg: "h-12 px-5 text-base [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-5",
        "icon-sm": "size-9 [&_svg]:size-[18px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type MediaButtonProps = VariantProps<typeof buttonVariants> & { className?: string };

/**
 * cva only concatenates, so a caller's `hidden` or `w-full` would sit next
 * to the base `inline-flex` and lose to stylesheet order. Merging through
 * `cn` (tailwind-merge) makes the caller's classes win.
 */
export function mediaButton({ className, ...variants }: MediaButtonProps = {}): string {
  return cn(buttonVariants(variants), className);
}
