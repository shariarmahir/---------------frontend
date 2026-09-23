import { Icon } from "@/components/ui/icon";
import { crimeCategories, crimeClips, crimeTiers } from "@/data/crime-index";
import { cn } from "@/lib/utils";

/**
 * The vertical evidence shelf.
 *
 * Clips are media about an incident, not case records — they carry no
 * accused party and no identity slot at all, which is why `CrimeClip` is
 * a separate type from `CrimeRecord`.
 *
 * Thumbnails are category glyphs, not photographs: real footage of an
 * incident shows faces, and those faces would need the same conviction
 * test the records get. When real clips are wired up, each needs a
 * verified source and faces blurred unless a court has ruled.
 */
export function CrimeClips() {
  return (
    <section
      className="w-full border-y border-border bg-bdgreen-50/40 px-gutter py-space-lg"
      aria-labelledby="crime-clips-title"
    >
      <div className="mx-auto flex max-w-360 flex-col gap-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-national-crimson text-white">
              <Icon name="play_arrow" className="text-[20px]" filled />
            </span>
            <div className="flex flex-col">
              <h2
                id="crime-clips-title"
                className="font-display text-headline-sm font-bold text-slate-900"
              >
                নাগরিক ভিডিও ও সিসিটিভি ক্লিপ
              </h2>
              <p className="font-mono text-[0.6875rem] text-slate-600">
                সংক্ষিপ্ত প্রমাণ · যাচাইয়ের পর প্রকাশিত
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1 font-mono text-label-xs font-semibold text-bd-green">
            <span className="size-2 rounded-full bg-bd-green" />
            {crimeClips.length} টি ক্লিপ
          </span>
        </div>

        <ul className="grid grid-cols-2 gap-space-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {crimeClips.map((clip) => {
            const category = crimeCategories.find(
              (c) => c.id === clip.category,
            );
            const tier =
              crimeTiers.find((t) => t.id === category?.tier) ?? crimeTiers[0];

            return (
              <li key={clip.id}>
                <article className="group relative overflow-hidden rounded-xl border border-border bg-white">
                  <div className="relative aspect-9/16 w-full overflow-hidden bg-slate-800">
                    {/* No photograph: see the provenance note in
                        data/crime-index.ts. A category glyph claims
                        nothing, where an unrelated stock face would
                        accuse whoever is in it. */}
                    <div
                      aria-hidden
                      className={cn(
                        "absolute inset-0 flex items-start justify-center pt-8",
                        tier.plate,
                      )}
                    >
                      <Icon
                        name={category?.icon ?? "gavel"}
                        className="text-[64px] opacity-45"
                      />
                    </div>
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-linear-to-t from-slate-950/92 via-slate-950/35 to-transparent"
                    />

                    <span
                      className={cn(
                        "absolute top-2 left-2 max-w-[calc(100%-1rem)] truncate rounded px-2 py-0.5 font-mono text-[0.625rem] font-bold shadow-sm",
                        tier.badge,
                      )}
                    >
                      {category?.banglaLabel}
                    </span>

                    <div className="absolute inset-x-2 bottom-2 flex flex-col gap-1 text-white">
                      <span className="flex items-center gap-1 font-mono text-[0.625rem] text-bdgreen-100">
                        <Icon
                          name="location_on"
                          className="shrink-0 text-[13px]"
                        />
                        <span className="truncate">
                          {clip.area}, {clip.district}
                        </span>
                      </span>
                      <h3 className="line-clamp-2 font-display text-[0.75rem] leading-snug font-semibold">
                        {clip.headline}
                      </h3>
                      <div className="flex items-center justify-between border-t border-white/25 pt-1 font-mono text-[0.625rem] text-white/85">
                        <span className="tabular-nums">{clip.views}</span>
                        <span className="truncate font-bold text-bdgreen-100">
                          {clip.statuteLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
