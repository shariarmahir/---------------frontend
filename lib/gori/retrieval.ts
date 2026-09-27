/**
 * Retrieval over the local evidence store — the "R" in the AI's RAG.
 *
 * Lexical scoring (module tag, then word overlap), deterministic and
 * explainable. TODO(backend): vector search over a reviewed evidence index.
 */

import { evidence, type EvidenceRecord } from "../../data/gori/evidence.ts";
import type { ModuleCode } from "../../data/gori/modules.ts";

const tokens = (s: string) =>
  s
    .toLowerCase()
    .split(/[^\p{L}\p{N}%.]+/u)
    .filter((t) => t.length > 1);

export interface Retrieved {
  record: EvidenceRecord;
  score: number;
}

export function retrieve({ module, query, limit = 6 }: { module?: ModuleCode; query?: string; limit?: number }): Retrieved[] {
  const q = new Set(tokens(query ?? ""));
  return evidence
    .map((record) => {
      let score = 0;
      if (module && record.modules.includes(module)) score += record.modules[0] === module ? 6 : 4;
      if (q.size) {
        const hay = new Set(tokens([record.title, record.publisher, ...record.extractedClaims, ...record.keywords].join(" ")));
        for (const t of q) if (hay.has(t)) score += 1;
      }
      // Rules travel with every answer: they are how claims get judged.
      if (record.sourceType === "rule") score += 0.5;
      return { record, score };
    })
    .filter((r) => r.score >= 1)
    .sort((a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id))
    .slice(0, limit);
}
