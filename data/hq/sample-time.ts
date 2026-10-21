import type { SeedCtx } from "../../lib/hq/seed.ts";
import type { HqDb } from "../../lib/hq/types.ts";

/** Sample data for কাণ্ডারী HQ, every record marked `sample: true` where the type allows. Placeholder: the calendar agent fills this: events, check-ins, leave requests, notices. */
export function seedTime(ctx: SeedCtx): Partial<HqDb> {
  void ctx;
  return {};
}
