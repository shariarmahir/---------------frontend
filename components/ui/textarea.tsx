import * as React from "react";
import { cn } from "@/lib/utils";

/** shadcn/ui Textarea, styled to match Input. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-lg border border-card-border bg-white px-3 py-2.5 text-[15px] leading-relaxed text-text-primary transition-[border-color,box-shadow]",
        "placeholder:text-text-muted hover:border-bd-green/40",
        "focus-visible:border-bd-green focus-visible:ring-2 focus-visible:ring-bd-green/20 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-national-crimson aria-invalid:ring-2 aria-invalid:ring-national-crimson/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
