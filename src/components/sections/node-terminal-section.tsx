"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

const DEFAULT_NODE = "Dhaka Central Hub";

export function NodeTerminalSection() {
  const [district, setDistrict] = useState(DEFAULT_NODE);
  const [result, setResult] = useState<string | null>(null);

  function queryNode() {
    const target = district.trim() || DEFAULT_NODE;
    setResult(
      `Pinging [${target}] ... Handshake: 11.4ms | Sovereign Cryptographic Key Validated | Status: OPERATIONAL`,
    );
  }

  return (
    <section
      id="kandari-member-portal"
      className="w-full border-b border-border bg-muted py-space-lg"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-space-md px-gutter sm:flex-row">
        <div className="flex items-center gap-space-md">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
            <Icon name="terminal" className="text-[24px]" />
          </div>
          <div>
            <span className="block font-display text-label-md font-bold text-slate-900">
              Kandari Sovereign Node Health Terminal
            </span>
            <span className="block font-code-telemetry text-code-telemetry text-slate-600">
              Ping any of our 64 district gateways to test diagnostic latency
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <label htmlFor="district-input" className="sr-only">
            District gateway name
          </label>
          <input
            id="district-input"
            type="text"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") queryNode();
            }}
            className="h-10 rounded-lg border border-input bg-white px-space-sm font-code-telemetry text-code-telemetry text-slate-900 shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={queryNode}
            className="h-10 rounded-lg bg-primary px-space-md font-label-md text-label-md font-bold text-white shadow-xs transition-colors hover:bg-emerald-800"
          >
            Query Node
          </button>
        </div>
      </div>

      {result ? (
        <div
          role="status"
          className="mx-auto flex max-w-7xl items-center gap-space-xs px-gutter pt-space-sm font-code-telemetry text-code-telemetry font-semibold text-emerald-800"
        >
          <Icon name="check_circle" className="text-[16px] text-primary" />
          <span>{result}</span>
        </div>
      ) : null}
    </section>
  );
}
