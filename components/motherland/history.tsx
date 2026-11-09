import { HISTORY, topicName } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR } from "./kit";
import { CardStack } from "./card-stack";

/**
 * History & Society: four moments in order, dealt edge to edge straight
 * after the introduction, as the reference site deals its own deck. The
 * category is named for screen readers; each card names its era.
 */
export function History() {
  return (
    <section id="history" aria-labelledby="history-title" className={cn(ANCHOR, "bg-ml-ink")}>
      <h2 id="history-title" className="sr-only">
        {topicName("history")}: {HISTORY.title}
      </h2>
      <CardStack cards={HISTORY.cards} />
    </section>
  );
}
