import type { Metadata } from "next";
import { Suspense } from "react";
import { MessagesApp, type ChatPerson } from "@/components/media/messages/messages-app";
import { Skeleton } from "@/components/ui/skeleton";
import { threads } from "@/data/media/chat";
import { CURRENT_USER_HANDLE, people } from "@/data/media/users";

export const metadata: Metadata = { title: "বার্তা ও ডিল" };

/** Only what the conversation view renders crosses to the client. */
const chatPeople: Record<string, ChatPerson> = Object.fromEntries(
  people.map(({ handle, nameBn, initials, tone, headline, idVerified }) => [handle, { handle, nameBn, initials, tone, headline, idVerified }]),
);

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Suspense fallback={<Skeleton className="h-[calc(100dvh-11.5rem)] rounded-2xl" />}>
        <MessagesApp seed={threads} people={chatPeople} me={CURRENT_USER_HANDLE} />
      </Suspense>
    </div>
  );
}
