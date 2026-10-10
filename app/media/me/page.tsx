import type { Metadata } from "next";
import { MyProfile } from "@/components/media/profile/me";
import { people } from "@/data/media/users";

export const metadata: Metadata = { title: "আমার প্রোফাইল" };

/** "আমি" — the signed-in account's own profile (sign-in is enforced by the layout's guard). */
export default function MePage() {
  return <MyProfile handles={people.map((p) => p.handle)} />;
}
