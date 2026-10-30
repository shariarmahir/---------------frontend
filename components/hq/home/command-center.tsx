"use client";

import { useHq } from "@/components/hq/provider";
import { ClientRoom, LeadRoom } from "./desk-rooms";
import { HrRoom } from "./hr-room";
import { ChiefRoom, PrimeRoom } from "./leadership-rooms";
import { MemberRoom } from "./member-room";

/**
 * /hq: every level has its own Command Center (data/hq/roles.ts names
 * them). Mahir's Command Room sees the whole company; the others show
 * what that role is answerable for.
 */
export function CommandCenter() {
  const level = useHq((v) => v.me.person.level);
  switch (level) {
    case "prime":
      return <PrimeRoom />;
    case "chief":
      return <ChiefRoom />;
    case "hr":
      return <HrRoom />;
    case "lead":
      return <LeadRoom />;
    case "client-manager":
      return <ClientRoom />;
    case "intern":
      return <MemberRoom intern />;
    default:
      return <MemberRoom />;
  }
}
