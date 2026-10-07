import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button looks for শিক্ষিতদের মিডিয়া, for <button> and <Link> alike, on the
 * light ground: yellow for the main action (black text — white on yellow
 * is under 2:1), solid blue for the strong second action, blue outline and
 * soft yellow for the rest, a short lift on hover and press.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border font-semibold whitespace-nowrap outline-none select-none [-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] active:duration-100 focus-visible:ring-2 focus-visible:ring-m-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-m-gold/25 bg-m-yellow text-m-ink shadow-m-tile hover:shadow-[0_14px_28px_-12px_rgb(143_86_0/0.5)]",
        green: "border-transparent bg-m-blue text-m-on shadow-m-ink hover:bg-m-blue-deep hover:shadow-[0_14px_28px_-12px_rgb(1_63_208/0.5)]",
        outline: "border-m-blue/50 bg-white text-m-blue hover:border-m-blue hover:bg-m-blue-soft",
        quiet: "border-m-ink/10 bg-m-card text-m-ink hover:border-m-ink/25 hover:bg-m-yellow/45",
        tile: "border-m-ink/8 bg-m-card text-m-blue shadow-m-ink hover:bg-m-yellow/45",
        /** On the white glass frame (top bar): a small glass tile that turns blue on hover. */
        frame: "frost-tile border-transparent text-m-ink/85 hover:bg-white hover:text-m-blue",
        ghost: "border-transparent bg-transparent text-m-ink/80 hover:bg-m-ink/6 hover:text-m-ink",
        danger: "border-m-red/50 bg-transparent text-m-red hover:border-m-red hover:bg-m-red hover:text-m-on",
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
