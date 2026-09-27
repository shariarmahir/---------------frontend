import { test } from "node:test";
import assert from "node:assert/strict";
import { codeOf, crossCutting, moduleLinks, moduleOf, modules, neighboursOf } from "./modules.ts";

test("BD-001 … BD-032, stable and unique", () => {
  assert.equal(modules.length, 32);
  assert.equal(modules[0].code, "BD-001");
  assert.equal(modules[31].code, "BD-032");
  assert.equal(new Set(modules.map((m) => m.code)).size, 32);
  for (const m of modules) assert.ok(m.titleBn && m.titleEn, m.code);
});

test("exactly the vertical-slice module has a full simulation", () => {
  const full = modules.filter((m) => m.simulation === "full");
  assert.deepEqual(full.map((m) => m.code), ["BD-001"]);
  assert.equal(full[0].scenarioId, "health-access");
});

test("links point at real modules, never at themselves, without duplicates", () => {
  const seen = new Set<string>();
  for (const l of moduleLinks) {
    assert.ok(moduleOf(l.from) && moduleOf(l.to), `${l.from}->${l.to}`);
    assert.notEqual(l.from, l.to);
    const k = `${l.from}->${l.to}`;
    assert.ok(!seen.has(k), `duplicate ${k}`);
    seen.add(k);
    assert.ok(l.note.length > 10);
  }
});

test("every module is connected to the network", () => {
  for (const m of modules) {
    const { upstream, downstream } = neighboursOf(m.code);
    assert.ok(upstream.length + downstream.length > 0, `${m.code} isolated`);
  }
});

test("cross-cutting themes name real modules", () => {
  for (const c of crossCutting) for (const code of c.modules) assert.ok(moduleOf(code), `${c.id} ${code}`);
  assert.equal(codeOf(7), "BD-007");
});
