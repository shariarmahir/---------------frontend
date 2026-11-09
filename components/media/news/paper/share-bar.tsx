"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { siFacebook, siWhatsapp, siX } from "simple-icons";
import { cn } from "@/lib/utils";

/*
 * The story page's share row (after The Daily Star's): copy the link, or
 * pass it to Facebook, X or WhatsApp. What travels is the publisher's own
 * address for the story, so whoever opens it reads the full story where it
 * was written. Nothing about the reader leaves the page.
 */

const cell =
  "grid size-11 place-items-center rounded-full bg-bdnavy-900 text-white ring-1 ring-white/12 transition-colors duration-150 hover:bg-signal-orange hover:text-text-primary focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none motion-reduce:transition-none";

function Brand({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d={path} />
    </svg>
  );
}

export function ShareBar({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(reset.current);
      reset.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused (old browser or no permission): the publisher button still carries the link.
    }
  };

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const out = [
    { label: "ফেসবুকে শেয়ার করুন", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: siFacebook.path },
    { label: "এক্স-এ শেয়ার করুন", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, icon: siX.path },
    { label: "হোয়াটসঅ্যাপে শেয়ার করুন", href: `https://wa.me/?text=${t}%20${u}`, icon: siWhatsapp.path },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button type="button" onClick={copy} aria-label={copied ? "লিংক কপি হয়েছে" : "লিংক কপি করুন"} title="লিংক কপি করুন" className={cell}>
        {copied ? <Check className="size-4 text-signal-orange" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      </button>
      {out.map((o) => (
        <a key={o.label} href={o.href} target="_blank" rel="noopener noreferrer" aria-label={`${o.label} (নতুন ট্যাবে খোলে)`} title={o.label} className={cell}>
          <Brand path={o.icon} />
        </a>
      ))}
      <span aria-live="polite" className="sr-only">
        {copied ? "লিংক কপি হয়েছে" : ""}
      </span>
    </div>
  );
}
