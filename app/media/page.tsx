import Link from "next/link";
import { FolderKanban, ImagePlus, Video } from "lucide-react";
import { FeedRail } from "@/components/media/feed/feed-rail";
import { MyPosts } from "@/components/media/feed/my-posts";
import { PostCard } from "@/components/media/feed/post-card";
import { EmptyState } from "@/components/media/ui/empty-state";
import { mediaButton } from "@/components/media/ui/button-styles";
import { PersonAvatar } from "@/components/media/ui/person";
import { categories, isCategoryId } from "@/data/media/categories";
import { getListing } from "@/data/media/market";
import { posts } from "@/data/media/posts";
import { currentUser, personOrThrow } from "@/data/media/users";
import { skillStatus } from "@/lib/media/skill";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "all", label: "সব পোস্ট" },
  { key: "verify", label: "যাচাই দরকার" },
  { key: "sale", label: "বিক্রির জন্য" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function href(tab: TabKey, c?: string) {
  const q = new URLSearchParams();
  if (tab !== "all") q.set("tab", tab);
  if (c) q.set("c", c);
  const s = q.toString();
  return s ? `/media?${s}` : "/media";
}

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ tab?: string; c?: string }> }) {
  const sp = await searchParams;
  const tab: TabKey = tabs.find((t) => t.key === sp.tab)?.key ?? "all";
  const cat = sp.c && isCategoryId(sp.c) ? sp.c : undefined;

  const shown = posts
    .filter((p) => (tab === "verify" ? skillStatus(p.skill.self, p.skill.communityAvg, p.skill.raters) !== "verified" : tab === "sale" ? Boolean(p.listingId) : true))
    .filter((p) => !cat || p.category === cat)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const usedCats = categories.filter((c) => posts.some((p) => p.category === c.id));

  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-4">
        <h1 className="sr-only">ফিড</h1>

        <div className="rounded-2xl border border-card-border bg-white p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <PersonAvatar person={currentUser} />
            <Link
              href="/media/post/new"
              className="flex h-11 flex-1 items-center rounded-full border border-card-border bg-slate-50 px-4 text-sm text-text-muted transition-colors hover:border-bd-green/40 hover:bg-white"
            >
              আজ কী বানালেন? দক্ষতার প্রমাণ পোস্ট করুন…
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { Icon: ImagePlus, label: "ছবি", kind: "image" },
              { Icon: Video, label: "ভিডিও", kind: "video" },
              { Icon: FolderKanban, label: "প্রজেক্ট ডেমো", kind: "project" },
            ].map(({ Icon, label, kind }) => (
              <Link key={kind} href={`/media/post/new?kind=${kind}`} className={mediaButton({ variant: "ghost", size: "sm", className: "w-full" })}>
                <Icon className="text-bd-green" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <nav aria-label="ফিড ফিল্টার" className="space-y-3">
          <div role="tablist" className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={href(t.key, cat)}
                role="tab"
                aria-selected={tab === t.key}
                scroll={false}
                className={cn(
                  "flex min-h-9 items-center justify-center rounded-lg text-sm font-semibold transition-[background-color,color,box-shadow]",
                  tab === t.key ? "bg-white text-bd-green shadow-[0_1px_2px_rgb(15_23_42/0.08)]" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {t.label}
              </Link>
            ))}
          </div>
          <div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <ul className="flex w-max gap-2">
              {[{ id: undefined, bn: "সব বিভাগ" }, ...usedCats].map((c) => {
                const on = (c.id ?? null) === (cat ?? null);
                return (
                  <li key={c.id ?? "all"}>
                    <Link
                      href={href(tab, c.id)}
                      scroll={false}
                      aria-current={on ? "page" : undefined}
                      className={cn(
                        "inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                        on ? "border-bd-green bg-bd-green text-white" : "border-card-border bg-white text-text-secondary hover:border-bd-green/40 hover:text-bd-green",
                      )}
                    >
                      {c.bn}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {tab === "all" && !cat && <MyPosts />}

        {shown.length === 0 ? (
          <EmptyState
            icon="posts"
            title="এই ফিল্টারে কোনো পোস্ট নেই"
            body="অন্য বিভাগ বেছে নিন, অথবা এই বিভাগে প্রথম দক্ষতার প্রমাণটি আপনিই দিন।"
            action={<Link href="/media/post/new" className={mediaButton({ variant: "primary" })}>পোস্ট করুন</Link>}
          />
        ) : (
          shown.map((p) => (
            <PostCard key={p.id} post={p} author={personOrThrow(p.author)} listing={p.listingId ? getListing(p.listingId) : undefined} />
          ))
        )}
      </div>

      <aside className="sticky top-22 hidden w-80 shrink-0 xl:block">
        <FeedRail />
      </aside>
    </div>
  );
}
