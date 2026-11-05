/**
 * Control: the Kandari Shongbidhan (the company constitution — articles,
 * cases, verdicts, appeals) and the public website's content, orders and
 * incoming requests. Fairness is built in: every accused member can answer
 * before a verdict, fines never pass a tenth of the month's wage
 * (Bangladesh Labour Act 2006, s. 25), and the prime admin hears appeals.
 */
import { z } from "zod";
import { can } from "../rules.ts";
import { fineAllowed } from "../scoring.ts";
import type { Article, Case, ContentItem } from "../types.ts";
import { find, HqError, parse, type Ctx, type Domain } from "./ctx.ts";

const PENALTY = z.object({ kind: z.enum(["warning", "points", "treat", "duty", "fine"]), text: z.string().trim().min(2).max(300), amount: z.number().min(0).max(1e6).optional() });
const KIND = z.enum(["ad", "banner", "image", "card", "section", "video", "product", "service", "category", "email"]);
const STATUS = z.enum(["draft", "pending", "live", "archived"]);

function needJudge(ctx: Ctx): void {
  if (!can(ctx.me, "shongbidhan.judge")) throw new HqError("Only Shongbidhan judges can do that.", 403);
}
function theCase(ctx: Ctx, id: string): Case {
  return find(ctx.db.cases, id, "That case");
}
/** Money fined to a person in the verdict's month. */
function finedInMonth(ctx: Ctx, personId: string, month: string): number {
  return ctx.db.cases.filter((c) => c.accusedId === personId && c.verdict?.fine && c.verdict.at.slice(0, 7) === month && c.appeal?.outcome !== "overturned").reduce((s, c) => s + (c.verdict!.fine ?? 0), 0);
}

const itemInput = z.object({
  kind: KIND,
  title: z.string().trim().min(2).max(140),
  body: z.string().max(8000).default(""),
  fileId: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().optional(),
  price: z.number().min(0).max(1e9).optional(),
  slot: z.string().max(80).optional(),
  status: STATUS.default("draft"),
});

export const control: Domain = {
  actions: {
    "article.save": (ctx, p) => {
      needJudge(ctx);
      const v = parse(z.object({ id: z.string().optional(), part: z.string().trim().min(1).max(20), article: z.string().trim().min(1).max(10), section: z.string().trim().min(1).max(10), title: z.string().trim().min(2).max(140), text: z.string().trim().min(5).max(4000), penalty: PENALTY, crimePoints: z.number().int().min(0).max(100) }), p);
      if (v.id) {
        Object.assign(find(ctx.db.articles, v.id, "That article"), v);
        return v.id;
      }
      const a: Article = { ...v, id: ctx.id("art") };
      ctx.db.articles.push(a);
      return a.id;
    },
    "article.remove": (ctx, p) => {
      needJudge(ctx);
      const { id } = parse(z.object({ id: z.string() }), p);
      if (id === "art-help") throw new HqError("The help-request article is used by the TaskBook and can't be removed.");
      if (ctx.db.cases.some((c) => c.articleId === id)) throw new HqError("Cases cite this article; edit it instead of removing it.");
      ctx.db.articles = ctx.db.articles.filter((a) => a.id !== id);
    },

    "case.file": (ctx, p) => {
      const v = parse(z.object({ articleId: z.string(), accusedId: z.string(), evidence: z.string().trim().min(20).max(4000), fileIds: z.array(z.string()).max(10).default([]) }), p);
      if (v.accusedId === ctx.me.id) throw new HqError("You can't file a case against yourself.");
      find(ctx.db.articles, v.articleId, "That article");
      const who = ctx.person(v.accusedId);
      const c: Case = { id: ctx.id("cs"), ...v, byId: ctx.me.id, at: ctx.nowIso, status: "filed" };
      ctx.db.cases.push(c);
      ctx.notify(who.id, { kind: "case", title: "A Shongbidhan case was filed against you — you can answer it", href: "/hq/shongbidhan" });
      const judges = ctx.db.people.filter((x) => x.status === "active" && can(x, "shongbidhan.judge") && x.id !== who.id).map((x) => x.id);
      ctx.notify(judges, { kind: "case", title: `New case: ${who.name}`, href: "/hq/shongbidhan" });
      return c.id;
    },
    "case.answer": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), text: z.string().trim().min(10).max(4000) }), p);
      const c = theCase(ctx, v.id);
      if (c.accusedId !== ctx.me.id) throw new HqError("Only the accused can answer.", 403);
      if (c.verdict) throw new HqError("The verdict is already in — you can appeal instead.");
      c.showCause = { text: v.text, at: ctx.nowIso };
      c.status = "answered";
    },
    "case.verdict": (ctx, p) => {
      needJudge(ctx);
      const v = parse(z.object({ id: z.string(), guilty: z.boolean(), note: z.string().trim().min(5).max(2000), fine: z.number().min(0).max(1e6).optional() }), p);
      const c = theCase(ctx, v.id);
      if (c.accusedId === ctx.me.id) throw new HqError("You can't judge your own case.", 403);
      if (c.verdict) throw new HqError("This case already has a verdict.");
      if (!c.showCause && ctx.now - Date.parse(c.at) < 48 * 3600_000) throw new HqError("The accused has 48 hours to answer before a verdict.");
      const art = find(ctx.db.articles, c.articleId, "That article");
      const who = ctx.person(c.accusedId);
      let fine: number | undefined;
      let note = v.note;
      if (v.guilty && art.penalty.kind === "fine") {
        const requested = v.fine ?? art.penalty.amount ?? 0;
        fine = fineAllowed(requested, who.wage, finedInMonth(ctx, who.id, ctx.nowIso.slice(0, 7)));
        if (fine < requested) note += ` (Fine reduced from ৳${requested} to ৳${fine}: the law caps fines at a tenth of the month's wage${who.wage ? "" : ", and no wage is on record"}.)`;
      }
      c.verdict = { guilty: v.guilty, by: ctx.me.id, at: ctx.nowIso, note, fine };
      c.status = "decided";
      if (v.guilty && art.penalty.kind === "points") {
        ctx.db.points.push({ id: ctx.id("pt"), personId: who.id, at: ctx.nowIso, points: -Math.abs(art.penalty.amount ?? art.crimePoints), kind: "penalty", reason: `Shongbidhan: ${art.title}`, caseId: c.id });
      }
      ctx.notify([who.id, c.byId], { kind: "case", title: `Verdict: ${v.guilty ? "guilty" : "not guilty"} — ${art.title}`, body: note, href: "/hq/shongbidhan" });
    },
    "case.appeal": (ctx, p) => {
      const v = parse(z.object({ id: z.string(), text: z.string().trim().min(10).max(4000) }), p);
      const c = theCase(ctx, v.id);
      if (c.accusedId !== ctx.me.id) throw new HqError("Only the accused can appeal.", 403);
      if (!c.verdict?.guilty) throw new HqError("There's nothing to appeal.");
      if (c.appeal) throw new HqError("You've already appealed.");
      if (ctx.now - Date.parse(c.verdict.at) > 7 * 86400_000) throw new HqError("Appeals close seven days after the verdict.");
      c.appeal = { text: v.text, at: ctx.nowIso };
      c.status = "appealed";
      const prime = ctx.db.people.find((x) => x.level === "prime");
      if (prime) ctx.notify(prime.id, { kind: "case", title: `Appeal from ${ctx.me.name}`, href: "/hq/shongbidhan" });
    },
    "case.appealDecide": (ctx, p) => {
      if (ctx.me.level !== "prime") throw new HqError("Only the super prime admin hears appeals.", 403);
      const v = parse(z.object({ id: z.string(), outcome: z.enum(["upheld", "overturned"]) }), p);
      const c = theCase(ctx, v.id);
      if (!c.appeal || c.appeal.outcome) throw new HqError("There's no open appeal on this case.");
      c.appeal.outcome = v.outcome;
      c.appeal.by = ctx.me.id;
      c.status = "closed";
      if (v.outcome === "overturned") ctx.db.points = ctx.db.points.filter((e) => e.caseId !== c.id);
      ctx.notify(c.accusedId, { kind: "case", title: `Your appeal was ${v.outcome === "overturned" ? "accepted — the verdict is overturned" : "heard — the verdict stands"}`, href: "/hq/shongbidhan" });
    },
    "case.close": (ctx, p) => {
      needJudge(ctx);
      const { id } = parse(z.object({ id: z.string() }), p);
      theCase(ctx, id).status = "closed";
    },

    "item.save": (ctx, p) => {
      ctx.need("content.manage");
      const v = parse(itemInput.extend({ id: z.string().optional() }), p);
      const goingLive = v.status === "live" && ctx.me.level !== "prime";
      const status = goingLive ? "pending" : v.status;
      let item: ContentItem;
      if (v.id) {
        item = find(ctx.db.content, v.id, "That item");
        Object.assign(item, { ...v, url: v.url || undefined, status: goingLive && item.status === "live" ? "live" : status });
      } else {
        item = { ...v, url: v.url || undefined, id: ctx.id("ct"), status, order: ctx.db.content.filter((c) => c.kind === v.kind).length, by: ctx.me.id, at: ctx.nowIso };
        ctx.db.content.push(item);
      }
      if (goingLive && item.status === "pending" && !ctx.db.approvals.some((a) => a.kind === "content" && a.refId === item.id && a.status === "pending")) {
        ctx.ask({ kind: "content", title: `Publish ${item.kind}: ${item.title}`, refId: item.id, perm: "content.manage" });
      }
      return item.id;
    },
    "item.status": (ctx, p) => {
      ctx.need("content.manage");
      const v = parse(z.object({ id: z.string(), status: STATUS }), p);
      return control.actions["item.save"](ctx, { ...find(ctx.db.content, v.id, "That item"), url: find(ctx.db.content, v.id, "That item").url ?? "", status: v.status });
    },
    "item.remove": (ctx, p) => {
      ctx.need("content.manage");
      const { id } = parse(z.object({ id: z.string() }), p);
      ctx.db.content = ctx.db.content.filter((c) => c.id !== id);
    },
    "item.move": (ctx, p) => {
      ctx.need("content.manage");
      const v = parse(z.object({ id: z.string(), dir: z.union([z.literal(-1), z.literal(1)]) }), p);
      const item = find(ctx.db.content, v.id, "That item");
      const same = ctx.db.content.filter((c) => c.kind === item.kind).sort((a, b) => a.order - b.order);
      const i = same.indexOf(item);
      const other = same[i + v.dir];
      if (!other) return;
      [item.order, other.order] = [other.order, item.order];
    },
    "item.import": (ctx, p) => {
      ctx.need("content.manage");
      const v = parse(z.object({ rows: z.array(itemInput).min(1).max(500) }), p);
      for (const r of v.rows) {
        const status = r.status === "live" && ctx.me.level !== "prime" ? "pending" : r.status;
        ctx.db.content.push({ ...r, url: r.url || undefined, status, id: ctx.id("ct"), order: ctx.db.content.filter((c) => c.kind === r.kind).length, by: ctx.me.id, at: ctx.nowIso });
      }
      return v.rows.length;
    },
    "order.status": (ctx, p) => {
      ctx.need("content.manage");
      const v = parse(z.object({ id: z.string(), status: z.enum(["new", "accepted", "rejected", "delivered"]) }), p);
      find(ctx.db.orders, v.id, "That order").status = v.status;
    },

    /** Any member: a research proposal or a service request, decided in the approvals inbox. */
    request: (ctx, p) => {
      const v = parse(z.object({ kind: z.enum(["research", "service"]), title: z.string().trim().min(3).max(140), detail: z.string().trim().min(10).max(4000) }), p);
      ctx.ask({ kind: v.kind, title: v.title, detail: v.detail, refId: ctx.id(v.kind === "research" ? "rs" : "sv"), perm: "content.manage" });
    },
  },

  onDecide: {
    content: (ctx, ap, accepted) => {
      const item = ctx.db.content.find((c) => c.id === ap.refId);
      if (!item) return;
      item.status = accepted ? "live" : "draft";
      if (accepted) item.approvedBy = ctx.me.id;
    },
    research: (ctx, ap, accepted) => {
      ctx.notify(ap.by, { kind: "approval", title: accepted ? `Research approved: ${ap.title} — publish its first ticket on the task board` : `Research not approved yet: ${ap.title}`, href: "/hq/tasks" });
    },
    service: (ctx, ap, accepted) => {
      ctx.notify(ap.by, { kind: "approval", title: `${accepted ? "Service request accepted" : "Service request declined"}: ${ap.title}`, href: "/hq/clients" });
    },
  },
};

