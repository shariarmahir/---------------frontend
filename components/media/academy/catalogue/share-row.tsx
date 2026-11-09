"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "../../ui/language";

const cell = "inline-flex h-9 items-center gap-2 bg-(--c-bg) px-3 text-xs font-semibold text-(--c-muted) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)";

/**
 * Pass the page on: copy its link, or send it to Facebook or WhatsApp — the
 * two places this audience actually shares things. Only the page's address
 * leaves; nothing about the viewer does.
 */
export function ShareRow({ text, className }: { text: string; className?: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      clearTimeout(reset.current);
      reset.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused (an old browser or no permission): the address bar still has it.
    }
  };
  const open = (to: "facebook" | "whatsapp") => {
    const url = encodeURIComponent(location.href);
    const href = to === "facebook" ? `https://www.facebook.com/sharer/sharer.php?u=${url}` : `https://wa.me/?text=${encodeURIComponent(`${text} `)}${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("flex w-fit flex-wrap gap-px border border-(--c-line) bg-(--c-line)", className)}>
      <span className="hud flex h-9 items-center bg-(--c-bg) px-3 text-(--c-faint)">{t("শেয়ার")}</span>
      <button type="button" onClick={copy} className={cell}>
        {copied ? <Check className="size-3.5" aria-hidden /> : <Link2 className="size-3.5" aria-hidden />}
        <span aria-live="polite">{t(copied ? "কপি হয়েছে" : "লিংক কপি")}</span>
      </button>
      <button type="button" onClick={() => open("facebook")} className={cell}>
        {t("ফেসবুক")}
      </button>
      <button type="button" onClick={() => open("whatsapp")} className={cell}>
        {t("হোয়াটসঅ্যাপ")}
      </button>
    </div>
  );
}
