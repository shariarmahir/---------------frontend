import Link from "next/link";
import { BadgeCheck, Handshake, Star, Upload } from "lucide-react";
import { posts } from "@/data/media/posts";
import { isRated } from "@/data/media/topics";
import { people } from "@/data/media/users";
import { skillStatus } from "@/lib/media/skill";
import { Num } from "../ui/numerals";
import { Panel } from "../ui/layout";
import { PersonLine } from "../ui/person";
import { Stars } from "../ui/trust";
import { DailyPlan } from "../wellbeing/daily-plan";

const loop = [
  { Icon: Upload, title: "দক্ষতা পোস্ট করুন", body: "ছবি, ভিডিও বা প্রজেক্ট ডেমো — কাজই প্রমাণ।" },
  { Icon: Star, title: "নিজেকে রেটিং দিন", body: "সৎভাবে ১–৫। বেশি দাবি করলে ধরা পড়বে।" },
  { Icon: BadgeCheck, title: "কমিউনিটি যাচাই করে", body: "অন্যরা রেটিং দেয় — মিললে যাচাইকৃত, না মিললে চ্যালেঞ্জড।" },
  { Icon: Handshake, title: "সরাসরি হায়ার", body: "প্রোফাইল থেকেই দরদাম, চুক্তি, এসক্রো।" },
];

export function FeedRail() {
  const needsEyes = posts.filter(isRated).filter((p) => skillStatus(p.skill.self, p.skill.communityAvg, p.skill.raters) !== "verified").slice(0, 3);
  const top = people
    .flatMap((p) => p.skills.map((s) => ({ p, s })))
    .filter(({ s }) => skillStatus(s.self, s.communityAvg, s.raters) === "verified")
    .sort((a, b) => b.s.raters - a.s.raters)
    .slice(0, 4);

  return (
    <div className="space-y-4">
      <DailyPlan compact />
      <Panel title="যেভাবে কাজ করে">
        <ol className="space-y-4">
          {loop.map(({ Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-bd-green-light text-bd-green">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-bold text-text-primary">{title}</span>
                <span className="block text-xs leading-relaxed text-text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="আপনার চোখ দরকার" action={<Link href="/media?tab=verify" className="text-xs font-semibold text-bd-green hover:underline">সব</Link>}>
        <ul className="space-y-3">
          {needsEyes.map((p) => {
            const a = people.find((x) => x.handle === p.author)!;
            return (
              <li key={p.id}>
                <Link href={`/media/post/${p.id}`} className="group block rounded-xl p-2 -m-2 hover:bg-slate-50">
                  <span className="block text-sm font-semibold text-text-primary group-hover:text-bd-green">{p.skill.name}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                    {a.nameBn} · দাবি <Num value={p.skill.self} />★ · <Num value={p.skill.raters} /> জন
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="শীর্ষ যাচাইকৃত">
        <ul className="space-y-3">
          {top.map(({ p, s }) => (
            <li key={`${p.handle}-${s.skill}`} className="flex items-center justify-between gap-2">
              <PersonLine person={p} size="sm" meta={s.skill} />
              <span className="flex shrink-0 flex-col items-end">
                <Stars value={s.communityAvg} size={11} />
                <span className="text-[11px] text-text-muted">
                  <Num value={s.raters} /> জন
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
