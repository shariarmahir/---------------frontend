"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { ProfileAside } from "@/components/profile/profile-aside";
import { MemberHero, MemberTopBar } from "@/components/profile/member-hero";
import { MemberFeed } from "@/components/profile/member-posts";
import { mehek } from "@/data/member";
import { hasSession } from "@/lib/session";

/** Members reachable at /u/<slug>. Only Mehek exists so far. */
const MEMBERS = { [mehek.slug]: mehek };

export default function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean>();

  const member = MEMBERS[slug];

  useEffect(() => {
    if (hasSession()) {
      setSignedIn(true);
    } else {
      setSignedIn(false);
      router.replace("/login");
    }
  }, [router]);

  if (!member) notFound();

  if (!signedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="font-sans text-body-md text-text-muted" role="status">
          {signedIn === undefined
            ? "সেশন যাচাই করা হচ্ছে…"
            : "সাইন ইন পাতায় নেওয়া হচ্ছে…"}
        </p>
      </main>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-325 justify-center border-x border-card-border bg-white">
      <ProfileSidebar />

      <main className="flex min-h-screen w-full max-w-155 min-w-0 flex-col border-r border-card-border bg-mint-subtle/30">
        <MemberTopBar member={member} />
        <MemberHero member={member} />
        <MemberFeed />
      </main>

      <ProfileAside />
    </div>
  );
}
