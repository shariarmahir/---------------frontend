"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { can } from "@/lib/hq/rules";
import type { Perm } from "@/lib/hq/types";
import { Empty, hb } from "./kit";
import { useHq } from "./provider";

/** Shows the page only to holders of `perm` ("prime" = the super prime admin); others get a clear, calm explanation. */
export function Guard({ perm, children }: { perm: Perm | Perm[] | "prime"; children: ReactNode }) {
  const me = useHq((v) => v.me.person);
  const ok = perm === "prime" ? me.level === "prime" : (Array.isArray(perm) ? perm : [perm]).some((p) => can(me, p));
  if (ok) return <>{children}</>;
  return (
    <Empty icon={Lock} title="You don't have access to this page" className="mt-10" action={<Link href="/hq" className={hb.gold}>Back to the command center</Link>}>
      {perm === "prime" ? "Only the super prime admin can open it." : "Ask the super prime admin to grant you access from Access Control."}
    </Empty>
  );
}
