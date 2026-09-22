"use client";

import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { ProfileAside } from "@/components/profile/profile-aside";
import {
  ProfileIdentity,
  ProfileSetupCards,
  ProfileTabs,
  ProfileTopBar,
} from "@/components/profile/profile-header";
import { ProfilePost, WhoToFollow } from "@/components/profile/profile-post";
import { useSessionGate } from "@/lib/session";

export default function ProfilePage() {
  const signedIn = useSessionGate();

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

  // w-full so the row resolves against the viewport, not its content —
  // without it the centre column keeps its intrinsic width and spills past
  // both edges on phones.
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-325 justify-center border-x border-card-border bg-white">
      <ProfileSidebar />

      {/* min-w-0: as a flex child this defaults to min-width:auto and
          refuses to shrink below its content, overflowing on phones. */}
      <main className="flex min-h-screen w-full max-w-155 min-w-0 flex-col border-r border-card-border bg-white">
        <ProfileTopBar />
        <ProfileIdentity />
        <ProfileTabs />
        <ProfileSetupCards />
        <ProfilePost />
        <WhoToFollow />
      </main>

      <ProfileAside />
    </div>
  );
}
