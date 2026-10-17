import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/**
 * Who Kandari-Lab is and what it holds to, readable in one glance: a
 * photograph carrying the line the company is named from, and beside it one
 * paragraph and four values on solid fields, navy and ink in a checker.
 */
const VALUES = [
  { icon: "flag", title: "Built here, for here", body: "Problems solved by people who live with them, made in Bangladesh." },
  { icon: "diversity_3", title: "Open to all", body: "Priced and designed for every village, not only the cities." },
  { icon: "fact_check", title: "Proof before promises", body: "We show what works, and call research what it still is." },
  { icon: "grid_on", title: "One pixel at a time", body: "One sector fixed properly before the next. Healthcare first." },
];

const FIELDS = [
  { tile: "bg-bdnavy-900", glow: "var(--color-bdnavy-400)" },
  { tile: "bg-text-primary", glow: "var(--color-signal-orange)" },
];

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="section-band mx-auto max-w-7xl px-gutter-x">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <figure className="story-reveal group/photo relative overflow-hidden rounded-3xl bg-bdnavy-900 shadow-[0_30px_60px_-36px_rgb(0_0_0/0.9)] ring-1 ring-white/12">
          <div className="relative aspect-4/5 sm:aspect-5/4 lg:aspect-4/5">
            <Image
              src="/hero/Hero-10.jpg"
              alt="ভোরের কুয়াশায় দুই প্রবীণ একে অপরকে পানি এগিয়ে দিচ্ছেন"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              style={{ objectPosition: "50% 28%" }}
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/photo:scale-105 motion-reduce:transition-none motion-reduce:group-hover/photo:scale-100"
            />
            {/* The photograph melts into the navy under the line, as on the team cards. */}
            <div aria-hidden className="absolute inset-x-0 -bottom-px h-3/5 bg-linear-to-t from-bdnavy-900 via-bdnavy-900/75 to-transparent" />
          </div>
          <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8">
            <blockquote lang="bn" className="font-bengali text-[clamp(1.5rem,3.2vw,2.25rem)] leading-[1.3] font-bold text-white">
              কে আছ জোয়ান? হও আগুয়ান।
              <br />
              <span className="text-signal-orange">হাঁকিছে ভবিষ্যৎ।</span>
            </blockquote>
            <p lang="bn" className="font-bengali text-sm text-white/70">কাজী নজরুল ইসলাম, ‘কাণ্ডারী হুঁশিয়ার’</p>
          </figcaption>
        </figure>

        <div className="story-reveal flex flex-col gap-6">
          <h2 id="about-title" className="font-grotesk text-2xl leading-[1.2] font-bold tracking-tight text-balance text-signal-orange sm:text-3xl lg:text-4xl">
            Our Values, and Who We Are
          </h2>
          <p className="max-w-xl font-sans text-base leading-relaxed text-white/80">
            Kandari-Lab is a Bangladeshi deep-tech company. We see the country as a picture with broken
            pixels, one for every public service that fails its people, and we repair them one sector at a
            time with our own hardware, software and AI. Healthcare comes first: care within the golden two
            hours, in every village.
          </p>

          <ul className="grid gap-3 sm:grid-cols-2">
            {VALUES.map((v, i) => {
              // A checker: navy and ink alternate along each row and down each column.
              const field = FIELDS[(i + Math.floor(i / 2)) % 2];
              return (
                <li
                  key={v.title}
                  style={{ "--glow": field.glow } as CSSProperties}
                  className={cn(
                    "group/value flex gap-4 rounded-2xl p-5 text-white ring-1 ring-white/12 ring-inset",
                    "transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_40px_-22px_var(--glow)]",
                    "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                    field.tile,
                  )}
                >
                  <Icon
                    name={v.icon}
                    className="mt-0.5 text-[26px] text-signal-orange transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/value:-rotate-6 motion-reduce:transition-none"
                  />
                  <div className="min-w-0">
                    <h3 className="font-grotesk text-base font-bold">{v.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">{v.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/team" className={btn.gold}>
              Learn About Us
              <Icon name="arrow_forward" className="text-base" />
            </Link>
            <Link href="#charter" className={btn.goldOutline}>
              Our Mission
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
