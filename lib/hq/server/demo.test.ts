import { test } from "node:test";
import assert from "node:assert/strict";
import { ASSIGNABLE_LEVELS } from "../rules.ts";
import { seedDb } from "../seed.ts";
import { demoOffer, syncDemo } from "./demo.ts";
import { verifyPassword } from "./password.ts";
import { TEST_PASSWORD } from "./test-access.ts";

const NOW = Date.parse("2026-10-21T06:00:00.000Z");

function withPassword<T>(pw: string | undefined, fn: () => T): T {
  const before = process.env.HQ_DEMO_PASSWORD;
  if (pw === undefined) delete process.env.HQ_DEMO_PASSWORD;
  else process.env.HQ_DEMO_PASSWORD = pw;
  try {
    return fn();
  } finally {
    if (before === undefined) delete process.env.HQ_DEMO_PASSWORD;
    else process.env.HQ_DEMO_PASSWORD = before;
  }
}

test("demo sign-ins: one per level below prime, all on the demo password, and stable once made", () => {
  const db = seedDb(NOW, { samples: false });
  withPassword("demo-pass-26", () => {
    assert.equal(syncDemo(db), true);
    const demo = db.people.filter((p) => p.demo);
    assert.deepEqual(demo.map((p) => p.level).sort(), [...ASSIGNABLE_LEVELS].sort());
    for (const p of demo) {
      const acc = db.accounts.find((a) => a.personId === p.id)!;
      assert.ok(acc.demo);
      assert.ok(verifyPassword("demo-pass-26", acc.salt, acc.passHash));
    }
    assert.equal(syncDemo(db), false);
    assert.equal(demoOffer()!.logins.length, ASSIGNABLE_LEVELS.length);
    assert.equal(db.people.filter((p) => p.level === "prime").length, 1);
  });
});

test("without HQ_DEMO_PASSWORD the demo sign-ins use the built-in test password", () => {
  const db = seedDb(NOW, { samples: false });
  withPassword(undefined, () => {
    assert.equal(demoOffer()!.password, TEST_PASSWORD);
    syncDemo(db);
  });
  const acc = db.accounts.find((a) => a.demo)!;
  assert.ok(verifyPassword(TEST_PASSWORD, acc.salt, acc.passHash));
});

test("demo sign-ins go when the password is off and come back when it returns", () => {
  const db = seedDb(NOW, { samples: false });
  withPassword("demo-pass-26", () => syncDemo(db));
  withPassword("off", () => {
    assert.equal(demoOffer(), null);
    assert.equal(syncDemo(db), true);
  });
  assert.equal(db.accounts.filter((a) => a.demo).length, 0);
  assert.ok(db.people.filter((p) => p.demo).every((p) => p.status === "left"));
  withPassword("another-pass", () => syncDemo(db));
  const acc = db.accounts.find((a) => a.demo)!;
  assert.ok(verifyPassword("another-pass", acc.salt, acc.passHash));
  assert.ok(db.people.filter((p) => p.demo).every((p) => p.status === "active"));
});

test("a too-short demo password turns demo sign-ins off", () => {
  const db = seedDb(NOW, { samples: false });
  withPassword("short", () => {
    assert.equal(demoOffer(), null);
    syncDemo(db);
  });
  assert.equal(db.accounts.filter((a) => a.demo).length, 0);
});

test("a retired demo seat (the old demo prime) loses its sign-in", () => {
  const db = seedDb(NOW, { samples: false });
  db.people.push({ ...db.people[0], id: "p-demo-prime", handle: "kandari@demo-prime", demo: true });
  db.accounts.push({ id: "acc-p-demo-prime", personId: "p-demo-prime", email: "x@y.test", handle: "kandari@demo-prime", passHash: "", salt: "", face: null, faceAt: null, failures: 0, lockedUntil: null, createdAt: "", lastLoginAt: null, epoch: 0, demo: true });
  withPassword("demo-pass-26", () => syncDemo(db));
  assert.ok(!db.accounts.some((a) => a.personId === "p-demo-prime"));
  assert.equal(db.people.find((p) => p.id === "p-demo-prime")!.status, "left");
});
