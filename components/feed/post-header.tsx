import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Initials badge standing in for an author photo. */
export function Avatar({
  initials,
  className,
  tone = "muted",
}: {
  initials: string;
  className?: string;
  tone?: "muted" | "mint" | "neutral";
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-grotesk font-bold",
        tone === "mint" && "bg-bd-green-light text-bd-green",
        tone === "muted" && "bg-mint-subtle text-bd-green",
        tone === "neutral" && "bg-slate-100 text-text-primary",
        className,
      )}
    >
      {initials}
    </div>
  );
}

export interface PostAuthor {
  initials: string;
  name: string;
  handle: string;
  meta: string;
  verified?: boolean;
  tone?: "muted" | "mint" | "neutral";
}

/** Author row — avatar, name, verification, handle, timestamp. */
export function PostHeader({
  author,
  trailing,
}: {
  author: PostAuthor;
  /** Badge or menu rendered at the row's right edge. */
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-space-sm">
      <div className="flex min-w-0 items-center gap-space-sm">
        <Avatar
          initials={author.initials}
          tone={author.tone}
          className="size-10 text-xs"
        />

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-x-space-xs">
            <span className="font-grotesk text-sm font-bold text-text-primary">
              {author.name}
            </span>
            {author.verified ? (
              <Icon name="verified" className="text-sm text-bd-green" filled />
            ) : null}
            <span className="font-sans text-xs text-text-muted">
              {author.handle}
            </span>
          </div>
          <span className="font-sans text-xs text-text-secondary">
            {author.meta}
          </span>
        </div>
      </div>

      {trailing ?? (
        <button
          type="button"
          aria-label="আরও বিকল্প"
          className="shrink-0 rounded-lg p-space-xs text-text-muted transition-colors hover:bg-mint-subtle hover:text-text-primary"
        >
          <Icon name="more_horiz" className="text-lg" />
        </button>
      )}
    </div>
  );
}

/** Hashtag chip row used by several posts. */
export function TagRow({
  tags,
  tone = "mint",
}: {
  tags: string[];
  tone?: "mint" | "neutral";
}) {
  return (
    <div className="flex flex-wrap items-center gap-space-xs">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "rounded px-space-xs py-0.5 font-sans text-[11px] font-bold",
            tone === "mint"
              ? "bg-mint-subtle text-bd-green"
              : "bg-slate-100 text-text-primary",
          )}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
