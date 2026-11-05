"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Post } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { intentCaption, readIntent } from "@/lib/media/share-intent";
import { newId, updateMedia } from "@/lib/media/store";
import { LinkCard } from "../feed/link-card";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { PersonAvatar } from "../ui/person";

const LIMIT = 2000;

/** The composer for a share request: the viewer's words on top, the link card under them, then post. */
export function ShareComposer() {
  const params = useSearchParams();
  const intent = useMemo(() => readIntent(params), [params]);
  const [caption, setCaption] = useState(() => (intent ? intentCaption(intent) : ""));
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  if (!intent) {
    return (
      <EmptyState
        icon="posts"
        title="শেয়ার করার মতো কিছু পাওয়া যায়নি"
        body="লিংকটি অসম্পূর্ণ বা এই সাইটের বাইরের। যে পাতা থেকে এসেছিলেন, সেখানে আবার “ফিডে শেয়ার” চাপুন।"
        action={<Link href="/media" className={mediaButton({ variant: "outline" })}>ফিডে ফিরুন</Link>}
      />
    );
  }

  function post(e: React.FormEvent) {
    e.preventDefault();
    if (!intent) return;
    const text = caption.trim();
    if (text.length < 3) return toast.error("পোস্টে অন্তত এক লাইন লিখুন");
    setBusy(true);
    const p: Post = {
      id: newId("p"),
      kind: "project",
      topic: "research",
      author: currentUser.handle,
      category: "research",
      createdAt: new Date().toISOString(),
      caption: text.slice(0, LIMIT),
      media: [],
      tags: intent.tags,
      stats: { likes: 0, shares: 0, views: 0 },
      comments: [],
      link: intent.link,
    };
    if (!updateMedia((s) => ({ ...s, posts: [p, ...s.posts] }))) {
      setBusy(false);
      return toast.error("পোস্ট করা গেল না", { description: "সাইন ইন আছেন কি না দেখুন।" });
    }
    toast.success("ফিডে পোস্ট হলো");
    router.push(`/media/post/${p.id}`);
  }

  return (
    <form onSubmit={post} className="live-in space-y-4 rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 sm:p-6 shadow-m-tile">
      <div className="flex items-center gap-3">
        <PersonAvatar person={currentUser} />
        <p className="min-w-0 text-sm">
          <span className="block font-bold text-m-ink">{currentUser.nameBn}</span>
          <span className="block truncate text-m-ink/60">গবেষণা পোস্ট · সবাই দেখতে পাবেন</span>
        </p>
      </div>
      <label htmlFor="share-caption" className="sr-only">পোস্টের লেখা</label>
      <textarea
        id="share-caption"
        rows={6}
        value={caption}
        maxLength={LIMIT}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full resize-y rounded-xl border border-m-ink/13 bg-m-canvas p-3.5 text-[15px] leading-relaxed text-m-ink placeholder:text-m-ink/40 focus-visible:border-m-blue focus-visible:ring-2 focus-visible:ring-m-blue/25 focus-visible:outline-none"
        placeholder="এই গবেষণা নিয়ে আপনার কথা…"
      />
      <LinkCard link={intent.link} />
      {intent.tags.length > 0 && <p className="flex flex-wrap gap-2 text-xs font-medium text-m-blue">{intent.tags.map((t) => <span key={t}>{t}</span>)}</p>}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-m-ink/9 pt-4">
        <button type="button" onClick={() => router.back()} className={mediaButton({ variant: "ghost" })}>বাতিল</button>
        <button type="submit" disabled={busy} className={mediaButton({ variant: "primary", size: "lg" })}>ফিডে পোস্ট করুন</button>
      </div>
    </form>
  );
}
