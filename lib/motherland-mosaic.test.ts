import assert from "node:assert/strict";
import { test } from "node:test";
import { mosaicCells, mosaicRows } from "./motherland-mosaic.ts";

test("every card is placed and no card sits alone on a row", () => {
  for (let n = 2; n <= 24; n++) {
    const rows = mosaicRows(n);
    assert.equal(rows.reduce((a, b) => a + b, 0), n, `count ${n}`);
    assert.ok(rows.every((r) => r === 2 || r === 3), `count ${n}: ${rows}`);
  }
});

test("each row fills the twelve columns", () => {
  for (let n = 1; n <= 24; n++) {
    const cells = mosaicCells(n);
    assert.equal(cells.length, n);
    let at = 0;
    for (const size of mosaicRows(n)) {
      const row = cells.slice(at, at + size);
      assert.equal(row.reduce((a, c) => a + c.span, 0), 12, `count ${n}`);
      at += size;
    }
  }
});

test("a lone card takes the whole width", () => {
  assert.deepEqual(mosaicCells(1), [{ span: 12, rowSize: 1, feature: true }]);
});
