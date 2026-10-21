import type { SeedCtx } from "../../lib/hq/seed.ts";
import type { HqDb } from "../../lib/hq/types.ts";

/** Sample data for কাণ্ডারী HQ, every record marked `sample: true` where the type allows. Placeholder: the chat agent fills this: teams, extra channels, messages, issues. */
export function seedChat(ctx: SeedCtx): Partial<HqDb> {
  void ctx;
  return {};
}
