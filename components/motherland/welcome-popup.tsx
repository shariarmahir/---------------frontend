"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { WELCOME } from "@/data/motherland";

const SEEN = "motherland-welcome-seen";
const DELAY = 2500;

/**
 * An invitation a few seconds after the page opens: a slim bar that glides to
 * the first story. From sm it sits on the hero's bottom edge, half over the
 * film, so it never covers the text below; on phones, where the hero fills the
 * screen, it rests at the screen's foot. It leaves when the hero does, and
 * closing or taking it up keeps it away for the rest of the visit. It never
 * takes focus.
 */
export function WelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || sessionStorage.getItem(SEEN)) return;
    const timer = window.setTimeout(() => setOpen(true), DELAY);
    const leaving = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) return;
        window.clearTimeout(timer);
        setOpen(false);
      },
      { threshold: 0.5 },
    );
    leaving.observe(hero);
    return () => {
      window.clearTimeout(timer);
      leaving.disconnect();
    };
  }, []);

  const close = () => {
    sessionStorage.setItem(SEEN, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <aside aria-label={WELCOME.title} className="ml-pop fixed inset-x-3 bottom-3 z-40 mx-auto flex w-fit max-w-[calc(100vw-1.5rem)] items-center gap-3 rounded-full bg-signal-orange py-1.5 pr-1.5 pl-5 text-ml-ink shadow-[0_16px_36px_-14px_rgb(0_0_0/0.6)] sm:absolute sm:bottom-0 sm:translate-y-1/2 sm:gap-5 sm:pl-7">
      <p className="text-sm font-semibold whitespace-nowrap sm:text-base">
        <span className="sm:hidden">{WELCOME.title}</span>
        <span className="max-sm:hidden">{WELCOME.text}</span>
      </p>
      <a
        href={WELCOME.cta.href}
        onClick={close}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ml-ink px-5 text-sm font-bold whitespace-nowrap text-white transition-colors hover:bg-ml-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-ink sm:text-base"
      >
        {WELCOME.cta.label}
      </a>
      <button type="button" onClick={close} className="grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-ml-ink/15 focus-visible:outline-2 focus-visible:outline-ml-ink">
        <Icon name="close" className="text-xl" />
        <span className="sr-only">Close</span>
      </button>
    </aside>
  );
}
