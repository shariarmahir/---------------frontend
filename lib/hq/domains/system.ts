/** House-keeping only the super prime admin may do. */
import { z } from "zod";
import { HqError, parse, type Domain } from "./ctx.ts";

export const system: Domain = {
  actions: {
    /** Removes every sample record (marked `sample: true`) once real work starts. */
    "samples.clear": (ctx, p) => {
      if (ctx.me.level !== "prime") throw new HqError("Only the super prime admin can clear sample data.", 403);
      parse(z.object({ confirm: z.literal("DELETE") }), p);
      const db = ctx.db as unknown as Record<string, unknown>;
      let removed = 0;
      for (const [key, value] of Object.entries(db)) {
        if (!Array.isArray(value)) continue;
        const kept = value.filter((x) => !(x && typeof x === "object" && (x as { sample?: boolean }).sample));
        removed += value.length - kept.length;
        db[key] = kept;
      }
      ctx.audit({ kind: "delete", detail: `samples cleared (${removed})` });
      return removed;
    },
    /**
     * The face check at sign-in. Off at first; once on, everyone signs in
     * with password + face, and members without a face on record add it at
     * their next sign-in.
     */
    "faceLock.set": (ctx, p) => {
      if (ctx.me.level !== "prime") throw new HqError("Only the super prime admin can change the face lock.", 403);
      const { on } = parse(z.object({ on: z.boolean() }), p);
      if (ctx.db.faceLock === on) return on;
      ctx.db.faceLock = on;
      ctx.audit({ kind: "security", detail: `face lock ${on ? "on" : "off"}` });
      return on;
    },
    /** Office-wide settings live in the time domain; this one is the audit export marker. */
    "audit.export": (ctx) => {
      ctx.need("audit.view");
      ctx.audit({ kind: "export", detail: "security log downloaded" });
    },
  },
};
