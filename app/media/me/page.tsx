import { redirect } from "next/navigation";
import { CURRENT_USER_HANDLE } from "@/data/media/users";

/** "আমি" — the signed-in viewer's own profile. */
export default function MePage() {
  redirect(`/media/u/${CURRENT_USER_HANDLE}`);
}
