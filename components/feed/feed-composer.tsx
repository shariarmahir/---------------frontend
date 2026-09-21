"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/feed/post-header";
import { domainPills, feedTabs } from "@/data/feed";
import { cn } from "@/lib/utils";

const CHAR_LIMIT = 280;

/** Sticky filter tabs above the feed. */
export function FeedTabs() {
  const [active, setActive] = useState(0);

  // Pins directly under the floating header card, which is shorter on
  // mobile (two levels) than on desktop (three).
  return (
    <div className="sticky top-header z-20 border-b border-card-border bg-white/95 backdrop-blur-md lg:top-header-lg">
      <div className="flex items-center justify-between gap-space-md px-space-md pt-space-sm">
        <div className="no-scrollbar flex items-center gap-space-lg overflow-x-auto">
          {feedTabs.map((tab, i) => {
            const isActive = active === i;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActive(i)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex shrink-0 items-center gap-space-xs py-space-sm font-sans text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "font-bold text-bd-green"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {tab.urgent ? (
                  <span className="size-2 animate-ping rounded-full bg-national-crimson" />
                ) : null}
                {tab.icon ? (
                  <Icon name={tab.icon} className="text-sm" />
                ) : null}

                <span>{tab.label}</span>

                {tab.count ? (
                  <span className="rounded-full bg-mint-subtle px-space-xs py-0.5 font-sans text-[11px] font-bold text-bd-green">
                    {tab.count}
                  </span>
                ) : null}

                {isActive ? (
                  <span className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-bd-green" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="hidden items-center gap-space-xs pb-space-xs sm:flex">
          <button
            type="button"
            title="টেলিমেট্রি ফিল্টার"
            aria-label="টেলিমেট্রি ফিল্টার"
            className="rounded-lg p-space-xs text-text-secondary transition-colors hover:bg-mint-subtle hover:text-bd-green"
          >
            <Icon name="tune" className="text-lg" />
          </button>
          <button
            type="button"
            title="লাইভ স্ট্রিম রিফ্রেশ"
            aria-label="লাইভ স্ট্রিম রিফ্রেশ"
            className="rounded-lg p-space-xs text-text-secondary transition-colors hover:bg-mint-subtle hover:text-bd-green"
          >
            <Icon name="refresh" className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** National innovation composer. */
export function FeedComposer() {
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const remaining = CHAR_LIMIT - text.length;

  const toggle = (tag: string) =>
    setPicked((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  return (
    <div className="flex flex-col gap-space-md rounded-xl border border-card-border bg-white p-space-md shadow-clean">
      <div className="flex items-start gap-space-md">
        <div className="relative shrink-0">
          <Avatar initials="MM" tone="mint" className="size-12 text-sm" />
          <span className="absolute -right-1 -bottom-1 flex items-center justify-center rounded-full bg-bd-green p-0.5 text-white shadow-xs">
            <Icon name="verified" className="text-[12px]" filled />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-grotesk text-sm font-bold text-text-primary">
              মাহির শারিয়ার মাহিন
            </span>
            <span className="font-sans text-xs text-text-secondary">
              @mahir_kandari
            </span>
            <span className="rounded bg-mint-subtle px-space-xs py-0.5 font-sans text-[11px] font-bold text-bd-green">
              Architect #001
            </span>
          </div>

          <label htmlFor="composer" className="sr-only">
            আপনার পোস্ট
          </label>
          <textarea
            id="composer"
            rows={3}
            maxLength={CHAR_LIMIT}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="কী ঘটছে বাংলাদেশে? জাতীয় সমস্যার কথা জানান বা আপনার প্রযুক্তিগত উদ্ভাবন শেয়ার করুন..."
            className="w-full resize-none bg-transparent font-sans text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
            {domainPills.map((tag) => {
              const on = picked.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(tag)}
                  className={cn(
                    "rounded-lg px-space-sm py-0.5 font-sans text-[11px] transition-colors",
                    on
                      ? "bg-signal-orange font-bold text-text-primary"
                      : "bg-mint-subtle text-text-secondary hover:bg-bd-green hover:text-white",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toolbar. */}
      <div className="-mx-space-md -mb-space-md flex flex-wrap items-center justify-between gap-space-sm rounded-b-xl bg-mint-subtle/60 p-space-md pt-space-sm">
        <div className="flex items-center gap-space-xs text-bd-green">
          {[
            { icon: "image", title: "ছবি/ডকুমেন্ট যুক্ত করুন" },
            { icon: "query_stats", title: "লাইভ টেলিমেট্রি গ্রাফ ইনজেক্ট করুন" },
            { icon: "mic", title: "বাংলা ভয়েস ইনপুট" },
            { icon: "terminal", title: "গিটহাব পিআর / কোড লিঙ্ক" },
          ].map((tool) => (
            <button
              key={tool.icon}
              type="button"
              title={tool.title}
              aria-label={tool.title}
              className="rounded-lg p-space-xs transition-colors hover:bg-white"
            >
              <Icon name={tool.icon} className="text-xl" />
            </button>
          ))}

          <div className="hidden items-center gap-space-xs pl-space-sm font-sans text-[11px] text-text-muted md:flex">
            <Icon name="share_location" className="text-sm text-bd-green" />
            <span>ঢাকা কোর গ্রিড #০১ [23.8103° N]</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-space-sm">
          <span
            className={cn(
              "hidden font-sans text-[11px] sm:inline",
              remaining < 20 ? "font-bold text-national-crimson" : "text-text-muted",
            )}
          >
            {remaining} অক্ষর বাকি
          </span>
          <button
            type="button"
            disabled={text.trim().length === 0}
            className="flex items-center gap-space-xs rounded-lg bg-signal-orange px-space-lg py-space-xs font-grotesk text-sm font-bold text-text-primary shadow-sm transition-all hover:bg-amber-600 hover:shadow-md active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-signal-orange disabled:hover:shadow-sm"
          >
            <Icon name="send" className="text-sm" />
            <span>পোস্ট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
