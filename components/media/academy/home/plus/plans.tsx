"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { courses, getDepartment } from "@/data/media/academy";
import { BATCH_MAX, CLASS_MINUTES, COURSE_DAYS, DEPT_KINDS, MIN_ATTENDANCE, PROMO_SECONDS, type DeptKind } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../../ui/button-styles";
import { Num, Taka } from "../../../ui/numerals";

/** The lowest fee a paid course of this kind of academy asks, from the catalogue. */
const fromFee = (kind: DeptKind) => Math.min(...courses.filter((c) => c.fee > 0 && getDepartment(c.dept)?.kind === kind).map((c) => c.fee));

/**
 * "Find the right plan": three cards — watch a class free, take a whole
 * course (solo or team academy, switched at the top of the card), or open
 * an academy and teach. The middle one, the whole path to a certificate, is marked.
 */
export function Plans() {
  const [kind, setKind] = useState<DeptKind>("solo");
  const fee = fromFee(kind);
  return (
    <section aria-labelledby="plans" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <h2 id="plans" className="text-center text-[clamp(1.5rem,3vw,2rem)] leading-tight font-bold text-balance text-m-ink">
        আপনার লক্ষ্যের জন্য ঠিক পথটা বেছে নিন
      </h2>
      <div className="mt-9 grid items-stretch gap-5 lg:grid-cols-3">
        <Plan
          title="একটা ক্লাস দেখে নিন"
          price={<Taka amount={0} />}
          sub="প্রতি সপ্তাহে প্রত্যেক শিক্ষকের একটা ক্লাস"
          action={{ href: "/media/academy/videos", label: "ক্লাস ভিডিও দেখুন", variant: "outline" }}
          points={["ভর্তি ছাড়াই দেখা যায়", "পছন্দের শিক্ষককে অনুসরণ করুন", "ভর্তি পরীক্ষাও বিনামূল্যে"]}
        />
        <Plan
          best
          title="পুরো কোর্স"
          head={
            <div role="radiogroup" aria-label="একাডেমির ধরন" className="mt-4 grid grid-cols-2 rounded-xl bg-m-ground p-1">
              {(Object.keys(DEPT_KINDS) as DeptKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={k === kind}
                  onClick={() => setKind(k)}
                  className={cn("h-9 rounded-lg text-sm font-semibold transition-[background-color,box-shadow,color] duration-200", k === kind ? "bg-white text-m-blue shadow-m-ink" : "text-m-ink/70 hover:text-m-ink")}
                >
                  {DEPT_KINDS[k]}
                </button>
              ))}
            </div>
          }
          chip={
            <>
              ব্যাচে সর্বোচ্চ <Num value={BATCH_MAX[kind]} /> জন
            </>
          }
          price={
            <>
              <Taka amount={fee} /> <span className="text-base font-semibold text-m-ink/60">থেকে</span>
            </>
          }
          sub="পুরো কোর্সের ফি · থাকে এসক্রোতে"
          action={{ href: "/media/academy/departments", label: "বিভাগে যোগ দিন", variant: "primary" }}
          points={[
            <>
              <Num value={5} /> সপ্তাহ অনলাইনে <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস
            </>,
            <>
              শেষ <Num value={5} /> দিন প্রজেক্ট আর প্যানেল — মোট <Num value={COURSE_DAYS} /> দিন
            </>,
            <>
              অন্তত <Num value={MIN_ATTENDANCE * 100} />% হাজিরায় ফাইনাল, পাসে যাচাইযোগ্য সনদ
            </>,
          ]}
        />
        <Plan
          title="একাডেমি খুলুন, শেখান"
          price={
            <>
              <Num value={5} />%
            </>
          }
          sub="প্ল্যাটফর্ম রাখে — বাকি ফি শিক্ষকের"
          action={{ href: "/media/academy/teach", label: "শিক্ষক হোন", variant: "outline" }}
          points={[
            "একা বা দল মিলে — প্রতি বিভাগে ঠিক ৩টি কোর্স",
            <>
              সিলেবাস, ক্যালেন্ডার আর <Num value={PROMO_SECONDS / 60} decimals={1} /> মিনিটের প্রোমো
            </>,
            "প্যানেল ইন্টারভিউ আর নমুনা ক্লাসে যোগ্যতা প্রমাণ",
            "দলে প্রতিটি বিষয় আলাদা সদস্য পড়ান",
          ]}
        />
      </div>
    </section>
  );
}

function Plan({
  title,
  head,
  chip,
  price,
  sub,
  action,
  points,
  best,
}: {
  title: string;
  head?: React.ReactNode;
  chip?: React.ReactNode;
  price: React.ReactNode;
  sub: string;
  action: { href: string; label: string; variant: "primary" | "outline" };
  points: React.ReactNode[];
  best?: boolean;
}) {
  return (
    <article className={cn("relative flex flex-col rounded-3xl bg-white p-6 sm:p-7", best ? "shadow-m-lift ring-2 ring-m-blue lg:-my-3 lg:py-10" : "shadow-m-tile ring-1 ring-m-ink/10")}>
      {best && <p className="absolute -top-3.5 left-6 rounded-full bg-m-blue px-3 py-1 text-xs font-bold text-m-on shadow-m-ink">শুরু থেকে সনদ পর্যন্ত</p>}
      <h3 className="text-xl font-bold text-m-ink">{title}</h3>
      {head}
      {chip && <p className="mt-4 w-fit rounded-md bg-m-green-soft px-2 py-0.5 text-xs font-bold text-m-green">{chip}</p>}
      <p className={cn("text-[2.25rem] leading-none font-bold text-m-ink tabular-nums", chip ? "mt-3" : "mt-5")}>{price}</p>
      <p className="mt-2 text-sm text-m-ink/65">{sub}</p>
      <Link href={action.href} className={mediaButton({ variant: action.variant, size: "lg", className: "mt-6 w-full" })}>
        {action.label}
      </Link>
      <ul className="mt-6 space-y-3 border-t border-m-ink/8 pt-6 text-[15px] text-m-ink/85">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2.5">
            <Check className="mt-0.5 size-4.5 shrink-0 text-m-green" strokeWidth={2.5} aria-hidden />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
