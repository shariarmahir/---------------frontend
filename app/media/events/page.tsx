import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Shirt, Sprout } from "lucide-react";
import { CreateEventButton, EventCard, MyEvents } from "@/components/media/community/events";
import { EmptyState } from "@/components/media/ui/empty-state";
import { chipClass } from "@/components/media/ui/field-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { eventKindBn, events } from "@/data/media/events";
import type { EventKind } from "@/data/media/types";

export const metadata: Metadata = { title: "উদ্যোগ" };

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  const kind = k && k in eventKindBn ? (k as EventKind) : undefined;
  const shown = events.filter((e) => !kind || e.kind === kind).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="উদ্যোগ"
        subtitle="চলো ১০০টা গাছ লাগাই, এলাকাটা পরিষ্কার করি — যে কেউ নেতৃত্ব দিতে পারেন, যে কেউ যোগ দিতে পারেন। প্রতিষ্ঠান স্পনসর করে লোগোসহ টি-শার্ট বা উপকরণ দেয়।"
        actions={<CreateEventButton />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <nav aria-label="উদ্যোগের ধরন" className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
            <ul className="flex w-max gap-2">
              <li><Link href="/media/events" scroll={false} aria-current={!kind ? "page" : undefined} className={chipClass(!kind)}>সব</Link></li>
              {(Object.keys(eventKindBn) as EventKind[]).map((key) => (
                <li key={key}>
                  <Link href={`/media/events?k=${key}`} scroll={false} aria-current={kind === key ? "page" : undefined} className={chipClass(kind === key)}>
                    {eventKindBn[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {!kind && <MyEvents />}
          {shown.length === 0 ? (
            <EmptyState icon="posts" title="এই ধরনের কোনো উদ্যোগ নেই" body="প্রথমটি আপনিই শুরু করুন।" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {shown.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-22 lg:self-start">
          <Panel title="যেভাবে চলে">
            <ol className="space-y-3 text-sm text-text-secondary">
              <li className="flex gap-2.5"><Sprout className="mt-0.5 size-4.5 shrink-0 text-bd-green" aria-hidden />একজন উদ্যোগ খোলেন — কী, কোথায়, কবে, কী লাগবে।</li>
              <li className="flex gap-2.5"><Shirt className="mt-0.5 size-4.5 shrink-0 text-bd-green" aria-hidden />এলাকার মানুষ যোগ দেন; সবাই পরিচয়-যাচাইকৃত।</li>
              <li className="flex gap-2.5"><Building2 className="mt-0.5 size-4.5 shrink-0 text-bd-green" aria-hidden />প্রতিষ্ঠান স্পনসর করে; খরচের হিসাব সবার সামনে।</li>
            </ol>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
