import type { Metadata } from "next";
import Link from "next/link";
import { SealCheck, SealWarning } from "@phosphor-icons/react/ssr";
import { LocalPost } from "@/components/media/feed/local-post";
import { PostCard } from "@/components/media/feed/post-card";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { Num } from "@/components/media/ui/numerals";
import { PersonLine } from "@/components/media/ui/person";
import { getListing } from "@/data/media/market";
import { getPost, posts } from "@/data/media/posts";
import { getPerson, personOrThrow } from "@/data/media/users";

export function generateStaticParams() {
  return posts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = getPost((await params).id);
  if (!p) return { title: "পোস্ট" };
  const a = personOrThrow(p.author);
  return { title: `${a.nameBn} — ${p.skill.name}`, description: p.caption };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPost(id);

  if (!post) {
    return (
      <div className="mx-auto max-w-170">
        <PageHeader title="পোস্ট" back={{ href: "/media", label: "ফিড" }} />
        <LocalPost id={id} />
      </div>
    );
  }

  const author = personOrThrow(post.author);
  const verdicts = post.comments.filter((c) => c.verdict);

  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0">
        <PageHeader title={post.skill.name} subtitle={`${author.nameBn}-এর দক্ষতার প্রমাণ`} back={{ href: "/media", label: "ফিড" }} />
        <PostCard post={post} author={author} listing={post.listingId ? getListing(post.listingId) : undefined} full />
      </div>
      <aside className="sticky top-22 hidden w-80 shrink-0 space-y-4 xl:block">
        <Panel title="কারা রেটিং দিয়েছেন">
          {verdicts.length === 0 ? (
            <p className="text-sm text-text-muted">মন্তব্যসহ কোনো রেটিং এখনো নেই। প্রথম যাচাইটি আপনিই করুন।</p>
          ) : (
            <ul className="space-y-3">
              {verdicts.map((c) => {
                const p = getPerson(c.author);
                if (!p || !c.verdict) return null;
                const ok = c.verdict.kind === "verify";
                return (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <PersonLine person={p} size="sm" meta={p.headline} />
                    <span className={ok ? "inline-flex items-center gap-1 text-xs font-bold text-bd-green" : "inline-flex items-center gap-1 text-xs font-bold text-national-crimson"}>
                      {ok ? <SealCheck size={16} weight="duotone" aria-hidden /> : <SealWarning size={16} weight="duotone" aria-hidden />}
                      <Num value={c.verdict.stars} />★
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-text-muted">
            মোট <Num value={post.skill.raters} /> জন রেটিং দিয়েছেন; এখানে শুধু যাঁরা কারণও লিখেছেন।
          </p>
        </Panel>
        <Panel title={`${author.nameBn}-কে কাজ দিতে চান?`}>
          <Link href={`/media/u/${author.handle}#hire`} className="flex h-11 items-center justify-center rounded-xl bg-signal-orange text-sm font-semibold text-text-primary transition-[filter] hover:brightness-95">
            প্রোফাইল থেকে হায়ার করুন
          </Link>
        </Panel>
      </aside>
    </div>
  );
}
