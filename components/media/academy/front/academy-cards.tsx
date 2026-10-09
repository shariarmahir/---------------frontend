"use client";

import { ArrowUpRight, GraduationCap, Landmark, Sparkles, Star } from "lucide-react";
import { academies, coursesOf } from "@/data/media/academy";
import { DEPT_KINDS } from "@/lib/media/academy";
import type { FinderAnswers } from "@/lib/media/journey";
import { useHydrated } from "@/lib/media/store";
import { Num } from "../../ui/numerals";
import { AssetCard, AssetGrid, FrameImage, FrameTag, frameClass } from "../catalogue/asset-card";
import { academyFit, factsOf } from "../finder/facts";
import { useAcademy } from "../use-academy";

/** From this score (of seven) an academy reads "খুব মিলেছে" to the finder's answers. */
const STRONG = 5;
const FACTS = new Map(academies.map((a) => [a.id, factsOf(a)]));
const EMPTY: FinderAnswers = {};

/**
 * Every academy as a press-kit card, best match first once the three
 * questions have answers (then by graduates). The frame is the academy's
 * picture, tagged when it suits; under the name, what it is about, its
 * departments, and its record; the button opens the academy.
 */
export function AcademyCards() {
  const hydrated = useHydrated();
  const saved = useAcademy((a) => a.finder ?? EMPTY);
  const photos = useAcademy((a) => a.academyMedia);
  const answers = hydrated ? saved : EMPTY;

  const ranked = academies
    .map((a) => ({ a, f: FACTS.get(a.id)!, match: academyFit(a, answers) }))
    .sort((x, y) => y.match - x.match || y.f.graduates - x.f.graduates);

  return (
    <AssetGrid count={ranked.length}>
      {ranked.map(({ a, f, match }, i) => {
        const first = a.departments[0];
        const cover = (hydrated ? photos[first.id]?.photo : undefined) ?? coursesOf(first.id).find((c) => c.image)?.image;
        return (
          <li key={a.id} className="bg-(--c-bg)">
            <AssetCard
              kind={{ icon: Landmark, label: DEPT_KINDS[a.kind] }}
              n={i + 1}
              frame={
                <div className={frameClass}>
                  {cover && <FrameImage src={cover} alt="" />}
                  {match > 0 && (
                    <FrameTag icon={Sparkles} className={match >= STRONG ? "bg-(--c-signal) text-black" : undefined}>
                      {match >= STRONG ? "খুব মিলেছে" : "মিলেছে"}
                    </FrameTag>
                  )}
                </div>
              }
              title={a.name}
              text={<p className="line-clamp-3">{a.about}</p>}
              extra={
                <>
                  <p className="mt-3 text-sm text-(--c-ink)">{a.departments.map((d) => `${d.name} বিভাগ`).join(" · ")}</p>
                  <p className="hud mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-(--c-faint)">
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="size-3.5" aria-hidden />
                      <Num value={f.graduates} /> গ্র্যাজুয়েট
                    </span>
                    {f.rating.count > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3.5" aria-hidden />
                        <Num value={f.rating.avg} /> রেটিং
                      </span>
                    )}
                  </p>
                </>
              }
              action={{
                href: `/media/academy/a/${a.id}`,
                label: "একাডেমি চিনুন",
                icon: ArrowUpRight,
                aside: (
                  <>
                    <Num value={a.departments.length} />টি বিভাগ · <Num value={f.courses.length} />টি কোর্স
                  </>
                ),
              }}
            />
          </li>
        );
      })}
    </AssetGrid>
  );
}
