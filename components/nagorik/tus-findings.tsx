import { Card, LINK, type Surface } from "@/components/bangladesh-landing/kit";
import { TUS } from "@/data/nagorik";

const SURFACES: Surface[] = ["navy", "ink", "cobalt", "navy"];

/**
 * The survey's headline findings. The ratios measure different things, so
 * they stand as figures, not bars on one axis; the one like-for-like pair
 * (an attitude by age) gets two meters on a shared 0–100% scale.
 */
export function TusFindings() {
  const lf = TUS.womenLabourForce;
  return (
    <div className="mt-6 grid gap-4 lg:mt-8">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TUS.ratios.map((r, i) => (
          <li key={r.value} className="flex">
            <Card surface={SURFACES[i]} className="w-full">
              <p className="font-grotesk text-4xl font-bold tracking-tight text-signal-orange tabular-nums lg:text-5xl">{r.value}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{r.text}</p>
            </Card>
          </li>
        ))}
      </ul>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card surface="ink">
          <h3 className="font-grotesk text-lg font-bold text-white">&ldquo;Men&rsquo;s work matters more than women&rsquo;s&rdquo;: who agrees</h3>
          <ul className="mt-5 grid gap-4">
            {TUS.menWorkMoreImportant.map((a) => (
              <li key={a.group}>
                <p className="flex justify-between text-sm">
                  <span className="text-white/80">{a.group}</span>
                  <span className="font-bold text-white tabular-nums">{a.pct}%</span>
                </p>
                <div aria-hidden className="mt-2 h-3 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-bdnavy-300" style={{ width: `${a.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-white/80">The younger group agrees less often: the old idea is already giving way.</p>
        </Card>
        <Card surface="navy">
          <h3 className="font-grotesk text-lg font-bold text-white">Women in the labour force</h3>
          <p className="mt-3 font-grotesk text-3xl font-bold text-signal-orange tabular-nums lg:text-4xl">
            {lf.from.pct}% <span className="text-xl text-white/65 lg:text-2xl">in {lf.from.year}</span> → {lf.to.pct}%{" "}
            <span className="text-xl text-white/65 lg:text-2xl">in {lf.to.year}</span>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/80">{TUS.bothShouldEarn}</p>
        </Card>
      </div>
      <Card surface="ink" className="hover:translate-y-0 hover:shadow-none">
        <h3 className="font-grotesk text-lg font-bold text-white">Source</h3>
        <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Survey", TUS.survey],
            ["Publisher", TUS.publisher],
            ["Sample", TUS.sample],
            ["Fieldwork", TUS.fieldwork],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-white/65">{k}</dt>
              <dd className="mt-1 leading-relaxed text-white">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm text-white/80">
          <a href={TUS.url} target="_blank" rel="noopener noreferrer" className={LINK}>
            Read the summary brief at UN Women
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </Card>
    </div>
  );
}
