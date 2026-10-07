"use client";

import { Download, ExternalLink, Lock } from "lucide-react";
import { currentUser } from "@/data/media/users";
import { MATERIAL_KINDS, type Course, type Material } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { MATERIAL_ICON } from "./desk/materials-desk";
import { useAcademy } from "./use-academy";

const EMPTY: Material[] = [];

/** A course's materials: what came with it and what its teacher added; files open once enrolled. */
export function CourseMaterials({ course }: { course: Course }) {
  const hydrated = useHydrated();
  const added = useAcademy((a) => a.materials[course.id] ?? EMPTY);
  const enrolled = useAcademy((a) => Boolean(a.enrolled[course.id]));
  const open = hydrated && (enrolled || currentUser.handle === course.teacher);
  const all = hydrated ? [...added, ...course.materials] : course.materials;

  return (
    <>
      <ul className="space-y-2.5">
        {all.map((m, i) => {
          const Icon = MATERIAL_ICON[m.kind];
          const isLink = m.href && !m.href.startsWith("data:");
          return (
            <li key={`${m.title}-${m.at ?? i}`} className="flex items-start gap-2.5 text-sm">
              <Icon className="mt-0.5 size-4 shrink-0 text-m-blue" aria-hidden />
              <span className="min-w-0 flex-1 text-m-ink/90">{m.title}</span>
              <span className="shrink-0 text-xs text-m-ink/65">{MATERIAL_KINDS[m.kind]} · {m.size}</span>
              {m.href &&
                (open ? (
                  <a
                    href={m.href}
                    {...(isLink ? { target: "_blank", rel: "noopener noreferrer nofollow" } : { download: m.file ?? m.title })}
                    className="shrink-0 text-m-blue hover:text-m-ink"
                    aria-label={isLink ? `${m.title} খুলুন` : `${m.title} ডাউনলোড`}
                  >
                    {isLink ? <ExternalLink className="size-4" aria-hidden /> : <Download className="size-4" aria-hidden />}
                  </a>
                ) : (
                  <Lock className="size-4 shrink-0 text-m-ink/55" aria-label="ভর্তি হলে খুলবে" />
                ))}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-m-ink/65">{open ? "যা শিক্ষক যোগ করেন, এখানেই আসে।" : "ভর্তি হলে ফাইলগুলো খুলবে।"}</p>
    </>
  );
}
