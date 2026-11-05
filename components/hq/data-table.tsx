"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { hb, inputCls } from "./kit";

/**
 * HQ's data table (TanStack Table): sortable headers, a search box, paging,
 * and a CSV download of what's filtered (Google Sheets opens it as is).
 * Rows rise in gently; on phones the table scrolls sideways inside its
 * panel, never the page.
 */
export function DataTable<T>({
  data,
  columns,
  search,
  csv,
  pageSize = 10,
  empty = "Nothing here yet.",
  onRow,
  toolbar,
  className,
}: {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  /** Placeholder for the search box; omit to hide it. */
  search?: string;
  /** File name and row → flat record for the CSV button; omit to hide it. */
  csv?: { name: string; row: (r: T) => Record<string, string | number>; onExport?: () => void };
  pageSize?: number;
  empty?: ReactNode;
  onRow?: (row: T) => void;
  toolbar?: ReactNode;
  className?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState("");
  // TanStack Table hands back a fresh instance each render by design; the compiler lint can't tell.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });
  const rows = table.getRowModel().rows;
  const pages = table.getPageCount();

  const download = () => {
    if (!csv) return;
    const records = table.getFilteredRowModel().rows.map((r) => csv.row(r.original));
    downloadCsv(csv.name, records);
    csv.onExport?.();
  };

  return (
    <div className={cn("min-w-0", className)}>
      {search || csv || toolbar ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {search ? (
            <label className="relative min-w-0 flex-1 sm:max-w-xs">
              <span className="sr-only">{search}</span>
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/45" />
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={search} className={cn(inputCls, "min-h-10 pl-9")} />
            </label>
          ) : null}
          {toolbar}
          {csv ? (
            <button type="button" onClick={download} className={cn(hb.quietSm, "ml-auto")}>
              <Download aria-hidden className="size-4" /> CSV / Google Sheet
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-xl ring-1 ring-white/10">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead className="bg-white/5">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const sort = h.column.getIsSorted();
                  return (
                    <th key={h.id} scope="col" aria-sort={sort === "asc" ? "ascending" : sort === "desc" ? "descending" : undefined} className="px-3 py-2.5 text-xs font-bold whitespace-nowrap text-white/70">
                      {h.isPlaceholder ? null : h.column.getCanSort() ? (
                        <button type="button" onClick={h.column.getToggleSortingHandler()} className="inline-flex min-h-8 items-center gap-1 rounded hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sort === "asc" ? <ArrowUp aria-hidden className="size-3.5" /> : sort === "desc" ? <ArrowDown aria-hidden className="size-3.5" /> : null}
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-white/60">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={r.id}
                  style={{ "--i": Math.min(i, 12) } as React.CSSProperties}
                  onClick={onRow ? () => onRow(r.original) : undefined}
                  className={cn("hq-rise border-t border-white/8", onRow && "cursor-pointer hover:bg-white/5")}
                >
                  {r.getVisibleCells().map((c) => (
                    <td key={c.id} className="px-3 py-3 align-middle text-white/85">
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 ? (
        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-white/65">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {pages}
          </span>
          <button type="button" aria-label="Previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className={hb.iconSm}>
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button type="button" aria-label="Next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className={hb.iconSm}>
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Saves rows as a UTF-8 CSV (with a BOM so Excel reads non-Latin text); Google Sheets: File → Import. */
export function downloadCsv(name: string, records: Record<string, string | number>[]): void {
  if (records.length === 0) return;
  const heads = Object.keys(records[0]);
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const text = [heads.join(","), ...records.map((r) => heads.map((h) => esc(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob(["﻿", text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name.endsWith(".csv") ? name : `${name}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
