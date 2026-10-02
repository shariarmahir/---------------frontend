import Link from "next/link";
import { ArrowUpRight, Earth, FlaskConical, FolderKanban, GraduationCap, LifeBuoy, Lock, MapPin, Megaphone, Tag, UsersRound } from "lucide-react";
import { getCategory } from "@/data/media/categories";
import { bgOf, feelingOf } from "@/data/media/feelings";
import { topicOf } from "@/data/media/topics";
import type { Listing, Person, Post } from "@/data/media/types";
import { CURRENT_USER_HANDLE, getPerson } from "@/data/media/users";
import { BG_MAX } from "@/lib/media/schemas";
import { roomHref } from "@/lib/media/showcase";
import { cn } from "@/lib/utils";
import { Ago, Taka } from "../ui/numerals";
import { MediaGallery } from "../ui/media-gallery";
import { PersonAvatar } from "../ui/person";
import { IdSeal } from "../ui/trust";
import { CommentThread, type CommentPeople } from "./comments";
import { LinkCard } from "./link-card";
import { LiveRatingPair } from "./live-rating";
import { FollowButton, PostActions } from "./post-actions";
import { TOPIC_ICON } from "./topic-style";

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
      className={cn("inline-flex min-h-7 items-center rounded-full border border-white/12 bg-text-primary px-2.5 text-xs font-semibold text-white/80 transition-colors hover:border-signal-orange/40 hover:text-signal-orange", className)}
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
  const topic = topicOf(post);
  const TopicIcon = TOPIC_ICON[topic.id];
  const feeling = feelingOf(post.feeling);
  // A short text-only post with a colour is set large on it.
  const bg = post.media.length === 0 && post.caption.length <= BG_MAX ? bgOf(post.bg) : undefined;
  const Audience = post.audience === "private" ? Lock : post.audience === "followers" ? UsersRound : Earth;
  return (
    <article id={post.id} className="scroll-mt-24 rounded-2xl border border-white/12 bg-text-primary story-reveal transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_24px_44px_-26px_var(--color-signal-orange)] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <header className="flex items-start gap-3 p-4 pb-0 sm:p-6 sm:pb-0">
        <Link href={`/media/u/${author.handle}`} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange">
          <PersonAvatar person={author} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1">
            <Link href={`/media/u/${author.handle}`} className="truncate text-[15px] font-bold text-white hover:text-signal-orange">
              {author.nameBn}
            </Link>
            {author.idVerified && <IdSeal />}
            {feeling && (
              <span className="truncate text-sm text-white/70">
                — <span aria-hidden>{feeling.emoji}</span> {feeling.line}
              </span>
            )}
          </p>
          <p className="flex min-w-0 items-center gap-1 text-xs text-white/65">
            <span className="truncate">{author.headline}</span>
            <span aria-hidden>·</span>
            <span className="shrink-0"><Ago iso={post.createdAt} live={live} /></span>
            {post.place && (
              <span className="inline-flex shrink-0 items-center gap-0.5">
                <span aria-hidden>·</span> <MapPin className="size-3" aria-hidden /> {post.place}
              </span>
            )}
            <span aria-hidden>·</span>
            <Audience className="size-3 shrink-0" aria-label={post.audience === "private" ? "শুধু আমি" : post.audience === "followers" ? "অনুসারীরা" : "সবাই দেখতে পারেন"} />
          </p>
        </div>
        <FollowButton handle={author.handle} />
      </header>

      <div className="space-y-4 p-4 sm:p-6">
        {post.topic === "help" && (
          <p className="flex items-center gap-2 rounded-xl bg-national-crimson px-3 py-2 text-sm font-semibold text-white">
            <LifeBuoy className="size-4.5 shrink-0" aria-hidden /> সাহায্য চাই — পারলে শেয়ার করুন, কেউ হয়তো কাছেই আছেন
          </p>
        )}

        {bg ? (
          <p className={cn("grid min-h-56 place-items-center rounded-2xl px-6 py-10 text-center text-2xl leading-snug font-bold whitespace-pre-line text-balance sm:text-[1.7rem]", bg.className)}>{post.caption}</p>
        ) : post.caption ? (
          <p className="text-[15px] leading-relaxed whitespace-pre-line text-white">{post.caption}</p>
        ) : null}

        <MediaGallery media={post.media} />

        {post.link && <LinkCard link={post.link} />}

        <div className="flex flex-wrap items-center gap-2">
          {post.skill ? (
            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-bd-green px-3 text-xs font-bold text-white">
              {post.kind === "project" ? <FolderKanban className="size-3.5" aria-hidden /> : <Tag className="size-3.5" aria-hidden />}
              {post.skill.name}
            </span>
          ) : null}
          {topic.id !== "skill" && (
            <Link
              href={`/media?t=${topic.id}`}
              className="inline-flex min-h-7 items-center gap-1 rounded-full bg-white/10 px-2.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15"
            >
              <TopicIcon className="size-3.5 text-signal-orange" aria-hidden />
              {topic.bn}
            </Link>
          )}
          {post.from && (
            <Link href={roomHref(post.from)} className="inline-flex min-h-7 items-center gap-1 rounded-full bg-bd-green px-2.5 text-xs font-semibold text-white transition-colors hover:bg-bdgreen-600">
              {post.from.kind === "lab" ? <FlaskConical className="size-3.5" aria-hidden /> : post.from.kind === "team" ? <UsersRound className="size-3.5" aria-hidden /> : <GraduationCap className="size-3.5" aria-hidden />}
              {post.from.name}
            </Link>
          )}
          {post.skill && <CategoryChip id={post.category} />}
          {post.tags.map((t) => (
            <span key={t} className="text-xs font-medium text-signal-orange">
              {t}
            </span>
          ))}
        </div>

        {post.skill && <LiveRatingPair postId={post.id} skill={post.skill} />}

        {post.topic === "rights" && (
          <Link
            href="/media/civic"
            className="flex items-center justify-between gap-3 rounded-xl border border-white/12 bg-white/10 px-4 py-3 text-sm transition-colors hover:border-signal-orange/40"
          >
            <span className="flex items-center gap-2 font-semibold text-white">
              <Megaphone className="size-4.5 text-signal-orange" aria-hidden /> নাগরিক বার্তায় অপরাধ ও এলাকার সমস্যা দেখুন, নিশ্চিত করুন
            </span>
            <ArrowUpRight className="size-4.5 shrink-0 text-white/65" aria-hidden />
          </Link>
        )}

        {listing && (
          <Link
            href={`/media/market/${listing.id}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-bdorange-600/60 bg-bdorange-600 px-4 py-3 transition-colors hover:border-bdorange-600/60 hover:bg-bdorange-600"
          >
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-text-primary">বিক্রির জন্য</span>
              <span className="block truncate text-sm font-semibold text-text-primary">{listing.title}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-base font-bold text-text-primary">
                <Taka amount={listing.price} />
              </span>
              <ArrowUpRight className="size-4.5 text-text-primary" aria-hidden />
            </span>
          </Link>
        )}

        <PostActions
          post={post}
          authorName={author.nameBn}
          commentCount={post.comments.length + replies}
          seedVerdict={post.comments.find((c) => c.author === CURRENT_USER_HANDLE && c.verdict)?.verdict}
        />

        <section id={full ? "discussion" : undefined} aria-label="আলোচনা" className={cn(full && "scroll-mt-24 border-t border-white/12 pt-5")}>
          {full && <h2 className="mb-4 text-base font-bold text-white">আলোচনা</h2>}
          <CommentThread postId={post.id} seed={post.comments} people={commentPeopleFor(post)} limit={full ? undefined : commentPreview} />
        </section>
      </div>
    </article>
  );
}
