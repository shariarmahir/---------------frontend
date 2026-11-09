"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { PostSkeleton } from "../ui/skeletons";

/**
 * The অনুসরণ tab. Who the viewer follows lives in their browser, so the
 * server renders every post and this keeps the ones by people they follow.
 */
export function FollowingFeed({ items }: { items: { id: string; author: string; node: ReactNode }[] }) {
  const hydrated = useHydrated();
  const following = useMediaState((s) => s.following);
  if (!hydrated) return <PostSkeleton />;
  const shown = items.filter((i) => following[i.author]);
  if (shown.length === 0)
    return (
      <EmptyState
        icon="profile"
        title="যাঁদের অনুসরণ করেন, তাঁদের নতুন পোস্ট নেই"
        body="মানুষ পাতা থেকে দক্ষ মানুষ খুঁজে অনুসরণ করুন — তাঁদের পোস্ট এখানে আসবে।"
        action={<Link href="/media/people" className={mediaButton({ variant: "primary" })}>মানুষ খুঁজুন</Link>}
      />
    );
  return (
    <>
      {shown.map((i) => (
        <Fragment key={i.id}>{i.node}</Fragment>
      ))}
    </>
  );
}
