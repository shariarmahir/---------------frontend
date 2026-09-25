import Link from "next/link";
import { ArrowUpRight, FolderKanban, Tag } from "lucide-react";
import { getCategory } from "@/data/media/categories";
import type { Listing, Person, Post } from "@/data/media/types";
import { CURRENT_USER_HANDLE, getPerson } from "@/data/media/users";
import { cn } from "@/lib/utils";
import { Ago, Taka } from "../ui/numerals";
import { MediaGallery } from "../ui/media-gallery";
import { PersonAvatar } from "../ui/person";
import { IdSeal } from "../ui/trust";
import { CommentThread, type CommentPeople } from "./comments";
import { LiveRatingPair } from "./live-rating";
import { FollowButton, PostActions } from "./post-actions";

/** Only the people a post's discussion mentions (plus the viewer) cross to the client. */
export function commentPeopleFor(post: Post): CommentPeople {
  const handles = new Set([CURRENT_USER_HANDLE, ...post.comments.flatMap((c) => [c.author, ...(c.replies ?? []).map((r) => r.author)])]);
  const out: CommentPeople = {};
  for (const h of handles) {
    const p = getPerson(h);
    if (p) out[h] = { handle: p.handle, nameBn: p.nameBn, initials: p.initials, tone: p.tone, idVerified: p.idVerified };
  }
  return out;
}

export function CategoryChip({ id, className }: { id: Post["category"]; className?: string }) {
  const c = getCategory(id);
  return (
    <Link
      href={`/media?c=${c.id}`}
      className={cn("inline-flex min-h-7 items-center rounded-full border border-card-border bg-white px-2.5 text-xs font-semibold text-text-secondary transition-colors hover:border-bd-green/40 hover:text-bd-green", className)}
    >
      {c.bn}
    </Link>
  );
}

/** A skill post: proof, the claim vs the community, the discussion. */
export function PostCard({
  post,
  author,
  listing,
  commentPreview = 2,
  full,
  live,
}: {
  post: Post;
  author: Person;
  listing?: Listing;
  /** How many comments to show inline; the post page shows all. */
  commentPreview?: number;
  full?: boolean;
  /** Created in this browser: time it against the real clock. */
  live?: boolean;
}) {
  const replies = post.comments.reduce((n, c) => n + (c.replies?.length ?? 0), 0);
  return (
    <article id={post.id} className="scroll-mt-24 rounded-2xl border border-card-border bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-shadow duration-200 hover:shadow-[0_6px_20px_-12px_rgb(15_23_42/0.18)]">
      <header className="flex items-start gap-3 p-4 pb-0 sm:p-6 sm:pb-0">
        <Link href={`/media/u/${author.handle}`} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bd-green">
          <PersonAvatar person={author} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1">
            <Link href={`/media/u/${author.handle}`} className="truncate text-[15px] font-bold text-text-primary hover:text-bd-green">
              {author.nameBn}
            </Link>
            {author.idVerified && <IdSeal />}
          </p>
          <p className="truncate text-xs text-text-muted">
            {author.headline} · <Ago iso={post.createdAt} live={live} />
          </p>
        </div>
        <FollowButton handle={author.handle} />
      </header>

      <div className="space-y-4 p-4 sm:p-6">
        <p className="text-[15px] leading-relaxed whitespace-pre-line text-text-primary">{post.caption}</p>

        <MediaGallery media={post.media} />

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-bd-green px-3 text-xs font-bold text-white">
            {post.kind === "project" ? <FolderKanban className="size-3.5" aria-hidden /> : <Tag className="size-3.5" aria-hidden />}
            {post.skill.name}
          </span>
          <CategoryChip id={post.category} />
          {post.tags.map((t) => (
            <span key={t} className="text-xs font-medium text-bd-green">
              {t}
            </span>
          ))}
        </div>

        <LiveRatingPair postId={post.id} skill={post.skill} />

        {listing && (
          <Link
            href={`/media/market/${listing.id}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50/60 px-4 py-3 transition-colors hover:border-orange-300 hover:bg-orange-50"
          >
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-orange-900">বিক্রির জন্য</span>
              <span className="block truncate text-sm font-semibold text-text-primary">{listing.title}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-base font-bold text-text-primary">
                <Taka amount={listing.price} />
              </span>
              <ArrowUpRight className="size-4.5 text-orange-800" aria-hidden />
            </span>
          </Link>
        )}

        <PostActions
          post={post}
          authorName={author.nameBn}
          commentCount={post.comments.length + replies}
          seedVerdict={post.comments.find((c) => c.author === CURRENT_USER_HANDLE && c.verdict)?.verdict}
        />

        <section id={full ? "discussion" : undefined} aria-label="আলোচনা" className={cn(full && "scroll-mt-24 border-t border-card-border pt-5")}>
          {full && <h2 className="mb-4 text-base font-bold text-text-primary">আলোচনা</h2>}
          <CommentThread postId={post.id} seed={post.comments} people={commentPeopleFor(post)} limit={full ? undefined : commentPreview} />
        </section>
      </div>
    </article>
  );
}
