/**
 * How a set of cards falls into rows: a wide pair, then three, then a pair
 * again, never leaving one card alone on its row. Each row fills the twelve
 * columns; `feature` marks the card that runs wide.
 */
export interface MosaicCell {
  /** Columns of twelve at desktop width. */
  span: 12 | 7 | 5 | 4;
  /** How many cards share the row, which sets the height of its pictures. */
  rowSize: 1 | 2 | 3;
  feature: boolean;
}

export function mosaicRows(count: number): number[] {
  const rows: number[] = [];
  let left = count;
  while (left > 0) {
    let take = rows.length % 2 === 0 ? 2 : 3;
    if (left < take) take = left;
    if (left - take === 1) take = take === 2 ? 3 : 2;
    rows.push(take);
    left -= take;
  }
  return rows;
}

export function mosaicCells(count: number): MosaicCell[] {
  const cells: MosaicCell[] = [];
  let pairs = 0;
  for (const size of mosaicRows(count)) {
    if (size === 1) cells.push({ span: 12, rowSize: 1, feature: true });
    else if (size === 3) for (let i = 0; i < 3; i++) cells.push({ span: 4, rowSize: 3, feature: false });
    else {
      const wideFirst = pairs % 2 === 0;
      cells.push({ span: wideFirst ? 7 : 5, rowSize: 2, feature: wideFirst }, { span: wideFirst ? 5 : 7, rowSize: 2, feature: !wideFirst });
      pairs += 1;
    }
  }
  return cells;
}
