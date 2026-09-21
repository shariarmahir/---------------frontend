"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/feed/post-header";
import { feedNav, innovators, trends } from "@/data/feed";
import { cn } from "@/lib/utils";

/** Left rail — primary navigation and the post action. */
export function FeedSidebar() {
  const [active, setActive] = useState("home");

  return (
    <aside className="fixed top-header-lg bottom-0 left-0 z-30 hidden w-72 flex-col justify-between border-r border-card-border bg-white px-space-md py-space-lg lg:flex">
      <div className="flex flex-col gap-space-md">
        <nav className="flex flex-col gap-space-xs">
          {feedNav.map((item) => {
            const isActive = active === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => setActive(item.path)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-space-md rounded-xl px-space-md py-space-sm text-left font-sans text-sm transition-all",
                  isActive
                    ? "bg-mint-subtle font-bold text-text-primary"
                    : "text-text-secondary hover:bg-mint-subtle/70 hover:text-text-primary",
                )}
              >
                <Icon name={item.icon} className="text-xl" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-space-sm rounded-lg bg-signal-orange px-space-md py-space-sm font-grotesk text-sm font-bold text-text-primary shadow-sm transition-all hover:bg-amber-600 hover:shadow-md"
        >
          <Icon name="add_circle" className="text-xl" />
          <span>পোস্ট করুন</span>
        </button>
      </div>

      {/* Signed-in identity. */}
      <div className="flex items-center justify-between gap-space-sm rounded-xl bg-mint-subtle p-space-sm">
        <div className="flex min-w-0 items-center gap-space-sm">
          <Avatar initials="TA" className="size-10 text-xs" />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="truncate font-grotesk text-xs font-bold text-text-primary">
                ড. তানভীর আহমেদ
              </span>
              <Icon name="verified" className="text-xs text-bd-green" filled />
            </div>
            <span className="truncate font-sans text-xs text-text-secondary">
              @tanvir_kandari
            </span>
          </div>
        </div>
        <Icon name="more_horiz" className="text-lg text-text-muted" />
      </div>
    </aside>
  );
}

/** Right rail — trends, innovators, and the civic trust note. */
export function FeedAside() {
  return (
    <aside className="fixed top-header-lg right-0 bottom-0 z-30 hidden w-80 flex-col gap-space-lg overflow-y-auto border-l border-card-border bg-white p-space-lg xl:flex">
      {/* Trending. */}
      <section className="rounded-xl bg-mint-subtle p-space-md">
        <div className="mb-space-sm flex items-center justify-between">
          <h2 className="font-grotesk text-base font-bold text-text-primary">
            বাংলাদেশে চলমান
          </h2>
          <Icon name="trending_up" className="text-lg text-bd-green" />
        </div>

        <div className="flex flex-col gap-space-md">
          {trends.map((trend) => (
            <div key={trend.title} className="flex flex-col">
              <span className="font-sans text-[11px] text-text-secondary">
                {trend.category}
              </span>
              <button
                type="button"
                className="text-left font-grotesk text-sm font-bold text-text-primary transition-colors hover:text-bd-green"
              >
                {trend.title}
              </button>
              <span className="font-sans text-[11px] text-text-muted">
                {trend.meta}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Innovators. */}
      <section className="rounded-xl bg-mint-subtle p-space-md">
        <div className="mb-space-sm flex items-center justify-between">
          <h2 className="font-grotesk text-base font-bold text-text-primary">
            শীর্ষ উদ্ভাবক ও গবেষক
          </h2>
          <Icon name="science" className="text-lg text-bd-green" />
        </div>

        <div className="flex flex-col gap-space-md">
          {innovators.map((person) => (
            <div
              key={person.name}
              className="flex items-center justify-between gap-space-sm"
            >
              <div className="flex min-w-0 items-center gap-space-sm">
                <Avatar
                  initials={person.initials}
                  tone="mint"
                  className="size-9 text-[11px]"
                />
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="truncate font-grotesk text-xs font-bold text-text-primary">
                      {person.name}
                    </span>
                    <Icon
                      name="verified"
                      className="shrink-0 text-xs text-bd-green"
                      filled
                    />
                  </div>
                  <span className="truncate font-sans text-[11px] text-text-muted">
                    {person.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 rounded-lg bg-white px-space-sm py-space-xs font-sans text-[11px] font-bold text-bd-green transition-all hover:bg-bd-green hover:text-white"
              >
                অনুসরণ
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Civic trust note. */}
      <section className="flex flex-col gap-space-xs px-space-xs text-text-secondary">
        <div className="flex items-center gap-space-xs font-sans text-[11px] font-bold text-bd-green">
          <Icon name="gavel" className="text-sm" />
          <span>কাণ্ডারী নাগরিক ট্রাস্ট ও প্রটোকল</span>
        </div>
        <p className="font-sans text-[11px] leading-normal text-text-muted">
          তথ্য সততা ও জাতীয় গবেষণা নীতিমালা মেনে নাগরিক সমস্যার যৌক্তিক সমাধান
          পেশ করুন।
        </p>
        <div className="flex flex-wrap items-center gap-x-space-sm gap-y-space-xs pt-space-xs font-sans text-[11px] text-text-muted">
          <button type="button" className="hover:text-text-primary">
            গোপনীয়তা
          </button>
          <span>•</span>
          <button type="button" className="hover:text-text-primary">
            শর্তাবলী
          </button>
          <span>•</span>
          <button type="button" className="hover:text-text-primary">
            ল্যাব লাইসেন্স
          </button>
          <span>•</span>
          <span>© ২০২৫ কাণ্ডারী</span>
        </div>
      </section>
    </aside>
  );
}
