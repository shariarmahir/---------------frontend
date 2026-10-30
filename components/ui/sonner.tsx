"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/** shadcn/ui Toaster (sonner), themed to the site tokens. */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border-card-border !bg-white !font-sans !text-text-primary !shadow-[0_8px_24px_-8px_rgb(15_23_42/0.25)]",
          description: "!text-text-secondary",
          success: "[&_[data-icon]]:!text-bd-green",
          error: "[&_[data-icon]]:!text-national-crimson",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
