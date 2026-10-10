import type { MyProfile } from "./store";
import type { Person } from "@/data/media/types";

/**
 * A new account has no demo member behind it, only the profile it built in
 * onboarding. This gives it the same shape, so one profile page and one CV
 * serve every member.
 */
export function personFromProfile(p: MyProfile): Person {
  return {
    handle: p.handle,
    name: p.displayName,
    nameBn: p.displayName,
    initials: p.displayName.trim().slice(0, 1),
    headline: p.headline,
    district: p.district,
    area: p.district,
    bio: p.bio,
    idVerified: true,
    skills: [],
    categories: p.categories,
    followers: 0,
    jobsDone: 0,
    clientRating: 0,
    responseTime: "—",
    openToWork: true,
    joined: p.verifiedAt.slice(0, 10),
    tone: "green",
    workHistory: [],
  };
}
