"use client";

import { Printer } from "lucide-react";
import { mediaButton } from "../ui/button-styles";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={mediaButton({ variant: "quiet" })}>
      <Printer aria-hidden /> প্রিন্ট / PDF
    </button>
  );
}
