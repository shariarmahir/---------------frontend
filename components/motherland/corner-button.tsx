"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * A page's one standing action. From lg it is a tab on the right edge under
 * "Join with us", in the margin clear of every card; on a phone a pill in the
 * corner. It waits until the hero has gone by and steps aside for the footer.
 */
export function CornerButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const check = () => {
      const footer = document.getElementById("ml-footer");
      const atFooter = !!footer && footer.getBoundingClientRect().top < window.innerHeight;
      setShown(window.scrollY > window.innerHeight * 0.7 && !atFooter);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  if (!shown) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 min-h-12 rounded-full bg-signal-orange px-6 font-semibold text-ml-navy shadow-[0_12px_28px_-8px_rgb(11_24_73/0.55)] transition-colors hover:bg-ml-navy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-navy lg:top-[calc(50%+5.75rem)] lg:right-0 lg:bottom-auto lg:min-h-0 lg:rounded-none lg:rounded-l-xl lg:px-2 lg:py-5 lg:text-sm"
    >
      <span className="lg:rotate-180 lg:[writing-mode:vertical-rl]">{children}</span>
    </button>
  );
}
