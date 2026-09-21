import { Icon } from "@/components/ui/icon";
import type { PostStats as Stats } from "@/data/feed";
import { cn } from "@/lib/utils";

const ACTION =
  "flex items-center gap-space-xs rounded-lg p-space-xs transition-colors hover:bg-mint-subtle hover:text-bd-green";

/** The interaction bar repeated under every post in the feed. */
export function PostStats({ stats }: { stats: Stats }) {
  const liked = stats.reactionIcon === "favorite";

  return (
    <div className="flex items-center justify-between pt-space-xs text-text-secondary">
      <button type="button" className={ACTION}>
        <Icon name="chat_bubble" className="text-lg" />
        <span className="font-sans text-xs">{stats.comments}</span>
      </button>

      <button type="button" className={ACTION}>
        <Icon name="repeat" className="text-lg" />
        <span className="font-sans text-xs">{stats.reposts}</span>
      </button>

      <button
        type="button"
        className={cn(
          "flex items-center gap-space-xs rounded-lg p-space-xs transition-colors",
          liked
            ? "text-national-crimson hover:bg-red-50"
            : "hover:bg-mint-subtle hover:text-bd-green",
        )}
      >
        <Icon name={stats.reactionIcon} className="text-lg" filled={liked} />
        <span
          className={cn("font-sans text-xs", liked && "font-bold")}
        >
          {stats.reactions}
        </span>
      </button>

      <button type="button" className={ACTION}>
        <Icon name="analytics" className="text-lg" />
        <span className="font-sans text-xs">{stats.views}</span>
      </button>

      <div className="flex items-center gap-space-xs">
        <button type="button" aria-label="সংরক্ষণ করুন" className={ACTION}>
          <Icon name="bookmark" className="text-lg" />
        </button>
        <button type="button" aria-label="শেয়ার করুন" className={ACTION}>
          <Icon name="share" className="text-lg" />
        </button>
      </div>
    </div>
  );
}
