import { NextResponse } from "next/server";
import { z } from "zod";
import { can } from "@/lib/hq/rules";
import { logAudit } from "@/lib/hq/server/audit";
import { enrolFace, hashPassword } from "@/lib/hq/server/crypto";
import { fail, requestMeta } from "@/lib/hq/server/session";
import { mutate } from "@/lib/hq/server/store";

const body = z.object({
  name: z.string().trim().min(2).max(80),
  nameBn: z.string().trim().max(80).default(""),
  email: z.string().trim().toLowerCase().email().max(120),
  phone: z.string().trim().regex(/^(\+?88)?01[3-9]\d{8}$/, "phone"),
  handle: z.string().trim().toLowerCase().regex(/^kandari@[a-z0-9]+-[a-z0-9]+$/, "handle"),
  dept: z.enum(["leadership", "creative", "dev", "iot", "ops", "hr", "client", "rnd", "finance"]),
  skills: z.array(z.string().min(1).max(40)).max(20),
  note: z.string().max(1500).default(""),
  password: z.string().min(10).max(200),
  captures: z.array(z.array(z.number())).min(3).max(5),
});

/**
 * A team member asks for their member ID and password (Mahir: the prime
 * admin sets designations, every member applies). The password is hashed
 * and the face enrolled now; the account only exists once someone with
 * `people.manage` approves it.
 */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const f = parsed.error.issues[0]?.path[0];
    const msg: Record<string, string> = {
      phone: "The mobile number isn't valid (01XXXXXXXXX).",
      handle: "The username must be kandari@name-dept, e.g. kandari@mehek-dev.",
      password: "The password must be at least 10 characters.",
      captures: "Three face captures are needed.",
      email: "The email isn't valid.",
    };
    return fail(msg[String(f)] ?? "Please fill in every field correctly.");
  }
  const v = { ...parsed.data, nameBn: parsed.data.nameBn || parsed.data.name };
  const face = enrolFace(v.captures);
  if (!face) return fail("The face captures didn't match each other. Face the light, look straight ahead and try again.");
  const { salt, hash } = hashPassword(v.password);
  const meta = await requestMeta();

  try {
    await mutate((d) => {
      const taken = (x: { email?: string | null; handle: string }) => x.email === v.email || x.handle === v.handle;
      if (d.accounts.some(taken) || d.applications.some((a) => a.status === "pending" && taken(a))) {
        throw new Error("duplicate");
      }
      const pending = d.applications.filter((a) => a.status === "pending").length;
      if (pending >= 50) throw new Error("full");
      const id = `app-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const at = new Date().toISOString();
      d.applications.push({ id, name: v.name, nameBn: v.nameBn, email: v.email, phone: v.phone, handle: v.handle, dept: v.dept, skills: v.skills, note: v.note, passHash: hash, salt, face, at, status: "pending" });
      d.approvals.push({ id: `ap-${id}`, kind: "application", title: `${v.name} (${v.handle}) requests a member ID`, detail: v.note || undefined, refId: id, by: id, at, perm: "people.manage", status: "pending" });
      for (const p of d.people) {
        if (p.status === "active" && can(p, "people.manage")) {
          d.notices.push({ id: `n-${id}-${p.id}`, to: p.id, at, kind: "approval", title: `New ID application: ${v.name}`, href: "/hq/approvals", read: false });
        }
      }
      logAudit(d, { kind: "apply", target: id, ...meta, detail: v.handle });
      return null;
    });
  } catch (e) {
    if ((e as Error).message === "duplicate") return fail("An account or application already uses that email or username.", 409);
    if ((e as Error).message === "full") return fail("Too many applications are waiting right now. Please try later.", 429);
    throw e;
  }
  return NextResponse.json({ ok: true });
}
