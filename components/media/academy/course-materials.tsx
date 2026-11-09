"use client";

import { Download, ExternalLink, Lock } from "lucide-react";
import { currentUser } from "@/data/media/users";
import { MATERIAL_KINDS, type Course, type Material } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { MATERIAL_ICON } from "./desk/materials-desk";
import { useAcademy } from "./use-academy";

const EMPTY: Material[] = [];

/** A course's materials as a ruled list: what came with it and what its teacher added; files open once enrolled. */
export function CourseMaterials({ course }: { course: Course }) {
  const hydrated = useHydrated();
  const added = useAcademy((a) => a.materials[course.id] ?? EMPTY);
  const enrolled = useAcademy((a) => Boolean(a.enrolled[course.id]));
  const open = hydrated && (enrolled || currentUser.handle === course.teacher);
  const all = hydrated ? [...added, ...course.materials] : course.materials;

  return (
    <>
      <ul className="border-t border-(--c-line)">
        {all.map((m, i) => {
          const Icon = MATERIAL_ICON[m.kind];
          const isLink = m.href && !m.href.startsWith("data:");
          return (
            <li key={`${m.title}-${m.at ?? i}`} className="flex items-center gap-3 border-b border-(--c-line) py-3 text-sm">
              <Icon className="size-4 shrink-0 text-(--c-accent-ink)" aria-hidden />
              <span className="min-w-0 flex-1 text-(--c-ink)">{m.title}</span>
              <span className="hud shrink-0 text-(--c-faint)">
                {MATERIAL_KINDS[m.kind]} · {m.size}
              </span>
              {m.href &&
                (open ? (
                  <a
                    href={m.href}
                    {...(isLink ? { target: "_blank", rel: "noopener noreferrer nofollow" } : { download: m.file ?? m.title })}
                    className="grid size-8 shrink-0 place-items-center border border-(--c-line) text-(--c-ink) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
                    aria-label={isLink ? `${m.title} খুলুন` : `${m.title} ডাউনলোড`}
                  >
                    {isLink ? <ExternalLink className="size-4" aria-hidden /> : <Download className="size-4" aria-hidden />}
                  </a>
                ) : (
                  <Lock className="size-4 shrink-0 text-(--c-faint)" aria-label="ভর্তি হলে খুলবে" />
                ))}
            </li>
          );
        })}
      </ul>
      <p className="hud mt-3 text-(--c-faint)">{open ? "যা শিক্ষক যোগ করেন, এখানেই আসে।" : "ভর্তি হলে ফাইলগুলো খুলবে।"}</p>
    </>
  );
}
