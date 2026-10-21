import type { SeedCtx } from "../../lib/hq/seed.ts";
import type { HqDb } from "../../lib/hq/types.ts";

/** Sample data for কাণ্ডারী HQ, every record marked `sample: true` where the type allows. Placeholder: the TaskBook agent fills this: tasks, points, badges, daily reports, todos, notes, help requests, wall stories. */
export function seedTasks(ctx: SeedCtx): Partial<HqDb> {
  void ctx;
  return {};
}
