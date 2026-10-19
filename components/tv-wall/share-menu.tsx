"use client";

import { useState } from "react";
import { Popover } from "radix-ui";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

const TEXT = "National TV Wall: crime, losses, achievements and the economy across Bangladesh, live. Free for everyone.";

async function copy(text: string, done: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(done);
  } catch {
    toast.error("Could not copy. Select the text and copy it by hand.");
  }
}

/**
 * Share the wall anywhere: the phone's own share sheet, the main social
 * networks, a link, the TV-screen link, or an embed code for any site. The
 * TV link is the one to open in an Android TV browser or to add as a browser
 * source in OBS to stream the wall live on YouTube or Facebook.
 */
export function ShareMenu({ className }: { className?: string }) {
  const [origin, setOrigin] = useState("");
  const page = `${origin}/tv-wall`;
  const tv = `${origin}/tv-wall/tv`;
  const embed = `<iframe src="${tv}" title="National TV Wall" width="1280" height="720" style="border:0;max-width:100%;aspect-ratio:16/9;height:auto" allow="autoplay; fullscreen" loading="lazy"></iframe>`;
  const enc = encodeURIComponent;
  const networks = [
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(page)}` },
    { name: "X", href: `https://x.com/intent/post?text=${enc(TEXT)}&url=${enc(page)}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${TEXT} ${page}`)}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${enc(page)}&text=${enc(TEXT)}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(page)}` },
  ];
  const row = "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left font-sans text-sm text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

  return (
    <Popover.Root onOpenChange={(open) => open && setOrigin(window.location.origin)}>
      <Popover.Trigger className={cn(btn.goldOutline, "min-h-10 px-4 py-2 text-sm", className)}>
        <Icon name="share" className="text-lg!" />
        Share & embed
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="menu-pop z-60 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl bg-bdnavy-900 p-2 text-white shadow-[0_28px_60px_-18px_rgb(0_0_0/0.8)] ring-1 ring-white/12"
        >
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button type="button" className={row} onClick={() => navigator.share({ title: "National TV Wall", text: TEXT, url: page }).catch(() => {})}>
              <Icon name="ios_share" className="text-lg! text-signal-orange" /> Share from this device
            </button>
          )}
          <div className="grid grid-cols-5 gap-1 px-1 py-1.5">
            {networks.map((n) => (
              <a
                key={n.name}
                href={n.href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid min-h-10 place-items-center rounded-lg bg-black/30 font-sans text-xs font-semibold text-white transition-colors hover:bg-signal-orange hover:text-text-primary focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
              >
                {n.name}
              </a>
            ))}
          </div>
          <button type="button" className={row} onClick={() => copy(page, "Link copied")}>
            <Icon name="link" className="text-lg! text-signal-orange" /> Copy link
          </button>
          <button type="button" className={row} onClick={() => copy(tv, "TV-screen link copied")}>
            <Icon name="tv" className="text-lg! text-signal-orange" />
            <span>
              Copy TV-screen link
              <span className="block text-xs text-white/60">Android TV, smart TV, OBS → YouTube Live</span>
            </span>
          </button>
          <div className="mt-1 rounded-xl bg-black/30 p-2.5">
            <p className="font-sans text-xs font-semibold text-white/80">Embed on your site</p>
            <textarea
              readOnly
              value={embed}
              rows={3}
              aria-label="Embed code"
              onFocus={(e) => e.currentTarget.select()}
              className="mt-1.5 w-full resize-none rounded-lg bg-black/50 p-2 font-mono text-xs leading-relaxed text-white/85 ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
            />
            <button type="button" onClick={() => copy(embed, "Embed code copied")} className={cn(btn.gold, "mt-2 min-h-9 w-full px-3 py-1.5 text-sm")}>
              <Icon name="code" className="text-lg!" />
              Copy code
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
