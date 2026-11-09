"use client";

import { Printer } from "lucide-react";
import { btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/** The e-paper's "ছাপুন": the browser's own print dialog, with the page's print styles. */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={cn(btn.gold, "print:hidden", className)}>
      <Printer className="size-4" aria-hidden />
      ছাপুন
    </button>
  );
}
