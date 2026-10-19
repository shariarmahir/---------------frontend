"use client";

import { divisionStats } from "@/lib/tv-wall/core";
import { Accountability, CrimeMix, DivisionRisk, HourlyChart, Method, RiskAdvice, Verdict, verdictLines } from "../analysis";
import { Panel } from "../panel";
import { useWallData } from "../wall-context";

/**
 * The wall's reading of the window: the day in three sentences, each
 * division's risk against its population with the chance of another
 * violent report, the day by hour, the crime mix, what to do and who
 * answers. It says how it is worked out.
 */
export function AnalysisPage() {
  const w = useWallData();
  const stats = divisionStats(w.national, w.hours);
  const all = w.division ? w.data.items.filter((i) => i.division === w.division) : w.data.items;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Panel title="Today's reading" sub={`Built from ${w.local.length} reports in the last ${w.hours} h`} icon="insights" field="cobalt" className="lg:col-span-12">
        <div className="px-5 pb-5">
          <Verdict lines={verdictLines(w.local, stats, w.division)} large />
        </div>
      </Panel>

      <Panel title="Division risk" sub="Press a division to focus every page on it" icon="query_stats" field="ink" className="lg:col-span-7" delay={90}>
        <div className="px-5 pb-5">
          <DivisionRisk stats={stats} division={w.division} onDivision={(id) => w.setDivision(w.division === id ? null : id)} />
        </div>
      </Panel>

      <div className="grid content-start gap-4 lg:col-span-5">
        <Panel title="Last 24 hours" sub="Reports per hour" icon="bar_chart" field="navy" delay={180}>
          <div className="px-5 pb-5">
            <HourlyChart items={all} now={w.now} height="h-44" />
          </div>
        </Panel>
        <Panel title="What is reported" sub="Crime reports by type" icon="category" field="ink" delay={270}>
          <div className="px-5 pb-5">
            <CrimeMix items={w.local} />
          </div>
        </Panel>
      </div>

      <Panel title="Lower the risk" sub="For what is being reported most" icon="health_and_safety" field="navy" className="lg:col-span-5" delay={360}>
        <div className="px-5 pb-5">
          <RiskAdvice items={w.local} />
        </div>
      </Panel>
      <Panel title="Who answers for it" sub="By law or mandate · call free" icon="account_balance" field="cobalt" className="lg:col-span-7" delay={450}>
        <div className="px-5 pb-5">
          <Accountability columns />
          <div className="mt-4">
            <Method />
          </div>
        </div>
      </Panel>
    </div>
  );
}
