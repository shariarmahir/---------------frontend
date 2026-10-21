import type { SeedCtx } from "../../lib/hq/seed.ts";
import type { HqDb } from "../../lib/hq/types.ts";

/** Sample data for কাণ্ডারী HQ, every record marked `sample: true` where the type allows. Placeholder: the control agent fills this: site content, orders, approvals, Shongbidhan cases, applications. */
export function seedControl(ctx: SeedCtx): Partial<HqDb> {
  void ctx;
  return {};
}
