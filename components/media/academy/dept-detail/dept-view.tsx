"use client";

import { useState } from "react";
import type { Department, Level } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { AudienceStrip, DeptFooter } from "../departments/dept-footer";
import { RememberDept } from "../departments/recent";
import { useAcademy } from "../use-academy";
import { Credentials, levelsOf } from "./credentials";
import { DeptCourses } from "./dept-courses";
import { DeptHero } from "./dept-hero";
import { Footnote, Join, Purpose, Resources, Similar, Stories, Workshops } from "./dept-sections";

/**
 * A department, laid out like a big course site's role page: the bar, the
 * hero with its fan, the facts, recommended courses by level, why you came
 * (which picks the level), joining, workshops, resources, success stories,
 * similar departments on a band, the small print and the footer.
 */
export function DeptView({ dept }: { dept: Department }) {
  const hydrated = useHydrated();
  const admission = useAcademy((a) => a.admissions[dept.id]);
  const levels = levelsOf(dept);
  // Start at the level the admission test placed you, if this department teaches it.
  const placed = hydrated && admission && levels.includes(admission.level) ? admission.level : undefined;
  const [chosen, setChosen] = useState<Level | undefined>(undefined);
  const level = chosen ?? placed ?? levels[0];

  return (
    <div>
      <RememberDept id={dept.id} />
      <AudienceStrip />
      <DeptHero dept={dept} />
      <div className="mx-auto max-w-7xl space-y-14 pt-12 pb-16">
        {level && <Credentials dept={dept} level={level} setLevel={setChosen} />}
        <DeptCourses dept={dept} />
        {levels.length > 0 && <Purpose levels={levels} onLevel={setChosen} />}
        <Join dept={dept} />
        <Workshops dept={dept} />
        <Resources dept={dept} />
        <Stories dept={dept} />
      </div>
      <Similar dept={dept} />
      <Footnote />
      <DeptFooter />
    </div>
  );
}
