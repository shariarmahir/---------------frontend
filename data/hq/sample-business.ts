import type { SeedCtx } from "../../lib/hq/seed.ts";
import type { HqDb } from "../../lib/hq/types.ts";

/** Sample data for কাণ্ডারী HQ, every record marked `sample: true` where the type allows. Placeholder: the business agent fills this: clients, projects, HR documents, finance transactions. */
export function seedBusiness(ctx: SeedCtx): Partial<HqDb> {
  void ctx;
  return {};
}
