import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-lg border border-card-border bg-white px-space-md py-space-sm font-sans text-body-md text-text-primary shadow-clean transition-all",
        "placeholder:text-text-muted",
        "hover:border-bd-green/40",
        "focus-visible:border-bd-green focus-visible:ring-2 focus-visible:ring-bd-green/20 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-national-crimson aria-invalid:ring-2 aria-invalid:ring-national-crimson/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
