import { test } from "node:test";
import assert from "node:assert/strict";
import { retrieve } from "../../lib/gori/retrieval.ts";
import { evidence, evidenceById } from "./evidence.ts";
import { moduleOf } from "./modules.ts";

test("ids are unique and every record is complete", () => {
  assert.equal(evidenceById.size, evidence.length);
  for (const e of evidence) {
    assert.ok(e.title && e.publisher && e.retrievalDate, e.id);
    assert.ok(e.extractedClaims.length > 0, e.id);
    for (const m of e.modules) assert.ok(moduleOf(m), `${e.id} -> ${m}`);
  }
});

test("no record invents a link or a publication date", () => {
  for (const e of evidence) {
    assert.equal(e.url, undefined, e.id);
    assert.equal(e.publicationDate, undefined, e.id);
  }
});

test("each of the 32 modules has its own dossier record", () => {
  for (let n = 1; n <= 32; n++) {
    const code = `BD-${String(n).padStart(3, "0")}` as const;
    assert.ok(evidence.some((e) => e.sourceType === "interpretation" && e.modules[0] === code), code);
  }
});

test("unsupported claims are marked as such", () => {
  const u = evidence.filter((e) => e.sourceType === "unsupported");
  assert.ok(u.length >= 4);
  for (const e of u) assert.equal(e.status, "unsupported");
});

test("retrieval ranks the module's own record first and is deterministic", () => {
  const a = retrieve({ module: "BD-001", query: "health access" });
  const b = retrieve({ module: "BD-001", query: "health access" });
  assert.deepEqual(a.map((r) => r.record.id), b.map((r) => r.record.id));
  assert.equal(a[0].record.modules[0], "BD-001");
  assert.ok(retrieve({ query: "inflation" }).some((r) => r.record.id === "EV-BASE-inflation"));
  assert.ok(retrieve({ module: "BD-001", limit: 3 }).length <= 3);
});
