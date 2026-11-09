"use client";

import { Empty, Panel } from "../panel";
import { FxBoard } from "../vitals";
import { useWallData } from "../wall-context";
import { WireList } from "../wire-list";

/** The economy: the taka against remittance currencies, and the economy reports. */
export function EconomyPage() {
  const w = useWallData();
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="grid content-start gap-4 lg:col-span-5">
        <Panel title="The taka" sub="Against the currencies Bangladeshis earn and send home in" icon="currency_exchange" field="cobalt">
          <FxBoard fx={w.data.fx} now={w.now} large />
        </Panel>
        <Panel title="Why these currencies" icon="info" field="ink" delay={90}>
          <p className="px-5 pb-5 font-sans text-sm leading-relaxed text-white/80">
            Saudi riyal, UAE dirham, Malaysian ringgit, the pound and the euro are the main remittance corridors; the rupee is the largest neighbouring trade currency. Rates come from ExchangeRate-API, which publishes them once a day.
          </p>
        </Panel>
      </div>
      <Panel title="Economy reports" sub={`${w.economy.length} in the last ${w.hours} h`} icon="query_stats" field="navy" className="lg:col-span-7" delay={180}>
        <WireList items={w.economy} now={w.now} fresh={w.fresh} limit={80} className="max-h-[75dvh]" empty={<Empty icon="query_stats" title="No economy reports" body="The collectors found no economy headlines in this window." />} />
      </Panel>
    </div>
  );
}
