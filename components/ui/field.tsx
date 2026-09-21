import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Shared control chrome so select/textarea match `Input` exactly. */
const CONTROL =
  "w-full rounded-lg border border-card-border bg-white px-space-md py-space-sm font-sans text-body-md text-text-primary shadow-clean transition-all placeholder:text-text-muted hover:border-bd-green/40 focus-visible:border-bd-green focus-visible:ring-2 focus-visible:ring-bd-green/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(CONTROL, "h-11 cursor-pointer appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xl text-text-muted"
      />
    </div>
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(CONTROL, "resize-none", className)}
      {...props}
    />
  );
}

/** Label + control wrapper with the required-asterisk convention. */
function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  /** Rendered at the row's right edge, e.g. an encryption score. */
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-space-sm">
        <label
          htmlFor={htmlFor}
          className="font-grotesk text-label-sm font-semibold text-text-primary"
        >
          {label}
          {required ? (
            <span className="text-national-crimson" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </label>
        {hint}
      </div>
      {children}
    </div>
  );
}

export { Select, Textarea, Field };
