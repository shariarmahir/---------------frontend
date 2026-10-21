/**
 * The one approvals inbox. A request names the permission that may decide
 * it; deciding hands it to the domain that owns its kind (DECIDERS, wired in
 * index.ts), which applies the yes or no, then the asker is told.
 */
import { z } from "zod";
import { can } from "../rules.ts";
import type { RequestKind } from "../types.ts";
import { find, HqError, parse, type Decide, type Domain } from "./ctx.ts";

export const DECIDERS: Partial<Record<RequestKind, Decide>> = {};

export const approvals: Domain = {
  actions: {
    decide: (ctx, p) => {
      const v = parse(z.object({ id: z.string(), accepted: z.boolean(), note: z.string().max(1000).optional(), extra: z.record(z.string(), z.unknown()).default({}) }), p);
      const ap = find(ctx.db.approvals, v.id, "That request");
      if (ap.status !== "pending") throw new HqError("This request was already decided.");
      if (!can(ctx.me, ap.perm)) throw new HqError("You don't have permission to decide this request.", 403);
      if (ap.by === ctx.me.id && ctx.me.level !== "prime") throw new HqError("You can't approve your own request.", 403);
      DECIDERS[ap.kind]?.(ctx, ap, v.accepted, { ...v.extra, note: v.note });
      ap.status = v.accepted ? "accepted" : "rejected";
      ap.decidedBy = ctx.me.id;
      ap.decidedAt = ctx.nowIso;
      ap.note = v.note;
      ctx.audit({ kind: v.accepted ? "approve" : "reject", target: ap.refId, detail: `${ap.kind}: ${ap.title}` });
      if (ap.kind !== "application") {
        ctx.notify(ap.by, { kind: "approval", title: `${v.accepted ? "Approved" : "Not approved"}: ${ap.title}`, body: v.note });
      }
    },
  },
};
