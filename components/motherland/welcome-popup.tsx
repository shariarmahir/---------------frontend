"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { WELCOME } from "@/data/motherland";

const SEEN = "motherland-welcome-seen";
const DELAY = 2500;

/**
 * The reference site's corner card (its "Fact Check"), here an invitation:
 * a few seconds after the page opens it rises in the bottom-left corner,
 * asks what you think and offers "Let's gooo!", which glides to the first
 * story. Closing it, or taking it up, keeps it away for the rest of the
 * visit. It never takes focus from what the visitor is doing.
 */
export function WelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SEEN)) return;
    const timer = window.setTimeout(() => setOpen(true), DELAY);
    return () => window.clearTimeout(timer);
  }, []);

  const close = () => {
    sessionStorage.setItem(SEEN, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <aside
      aria-labelledby="welcome-title"
      className="ml-pop fixed bottom-4 left-4 z-40 w-[min(calc(100vw-2rem),20rem)] rounded-2xl bg-signal-orange p-6 pt-5 text-center text-ml-ink shadow-[0_24px_48px_-16px_rgb(0_0_0/0.45)] sm:bottom-8 sm:left-8"
    >
      <button
        type="button"
        onClick={close}
        className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-ml-ink/10 transition-colors hover:bg-ml-ink/20 focus-visible:outline-2 focus-visible:outline-ml-ink"
      >
        <Icon name="close" className="text-xl" />
        <span className="sr-only">Close</span>
      </button>
      <p id="welcome-title" className="px-8 font-ml-display text-3xl tracking-[0.01em] uppercase">
        {WELCOME.title}
      </p>
      <p className="mt-3 leading-relaxed">{WELCOME.text}</p>
      <a
        href={WELCOME.cta.href}
        onClick={close}
        className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-ml-ink px-7 font-bold transition-colors hover:bg-ml-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-ink"
      >
        {WELCOME.cta.label}
        <Icon name="rocket_launch" className="text-xl" />
      </a>
    </aside>
  );
}
