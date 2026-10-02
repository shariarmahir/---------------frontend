import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button looks for শিক্ষিতদের মিডিয়া, for <button> and <Link> alike, in the
 * home page's language: gold for the main action (ink text — white on gold
 * is ~2:1), ink and outline for the rest, a short lift on hover and press.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border font-semibold whitespace-nowrap outline-none select-none [-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] active:duration-100 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-signal-orange text-text-primary shadow-tile hover:shadow-[0_14px_28px_-14px_var(--color-signal-orange)]",
        green: "border-transparent bg-bd-green text-white shadow-ink hover:bg-bdgreen-600 hover:shadow-[0_14px_28px_-14px_var(--color-bdgreen-500)]",
        outline: "border-signal-orange/50 bg-transparent text-signal-orange hover:border-signal-orange hover:bg-signal-orange/10",
        quiet: "border-white/12 bg-text-primary text-white hover:border-white/30 hover:bg-bd-green-dark",
        tile: "border-transparent bg-text-primary text-signal-orange shadow-ink hover:bg-bd-green-dark",
        ghost: "border-transparent bg-transparent text-white/80 hover:bg-white/10 hover:text-white",
        danger: "border-crimson-bright/50 bg-transparent text-crimson-bright hover:border-crimson-bright hover:bg-national-crimson hover:text-white",
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
