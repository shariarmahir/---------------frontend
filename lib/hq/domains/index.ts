/**
 * Every HQ domain, by the name the client calls it with:
 * `act("tasks", "take", { id })` → POST /api/hq/act → DOMAINS.tasks.actions.take.
 */
import { approvals, DECIDERS } from "./approvals.ts";
import { business } from "./business.ts";
import { chat } from "./chat.ts";
import type { Domain } from "./ctx.ts";
import { control } from "./control.ts";
import { issues } from "./issues.ts";
import { me } from "./me.ts";
import { people } from "./people.ts";
import { system } from "./system.ts";
import { tasks } from "./tasks.ts";
import { teams } from "./teams.ts";
import { time } from "./time.ts";

export const DOMAINS = { me, people, approvals, system, tasks, teams, chat, issues, time, business, control } satisfies Record<string, Domain>;
export type DomainName = keyof typeof DOMAINS;

for (const d of Object.values(DOMAINS) as Domain[]) Object.assign(DECIDERS, d.onDecide ?? {});
