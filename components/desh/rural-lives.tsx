import { StoryPhoto } from "@/components/bangladesh/story-photo";
import { StoryHeading } from "@/components/bangladesh/story-heading";
import { Icon } from "@/components/ui/icon";
import { ruralStories } from "@/data/rural-life";
import { toBanglaDigits } from "@/lib/bangla";
import { cn } from "@/lib/utils";

/** Frames for the founder's own field photographs from Kazaikat and beyond. */
const OWN_FRAMES = [
  { title: "কাজাইকাটি গ্রাম, নকলা", note: "স্বাস্থ্যকেন্দ্রের অপেক্ষায় মা ও শিশু — আপনার তোলা ছবি এখানে" },
  { title: "হাটের দিন", note: "ধানের দর কষাকষিতে কৃষক — মাঠ থেকে তোলা ছবি এখানে" },
  { title: "স্কুলফেরত নদী পারাপার", note: "খেয়া নৌকায় শিশুরা — আপনার ছবি এখানে" },
];

/**
 * The problems as lived: an editorial wall of rural photographs, each
 * carrying the pain it shows and a link to its dossier problem. The wall
 * alternates wide and tall tiles so it reads like a photo essay, not a grid
 * of equal cards.
 */
export function RuralLives() {
  return (
    <section id="rural" aria-labelledby="rural-title" className="section-band-tinted scroll-mt-40 bg-black text-white">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <StoryHeading
          id="rural-title"
          index="০৩"
          kicker="গ্রামীণ জীবন"
          title="মাঠ, নদী আর ভাটার মানুষ"
          accent="মানুষ"
          lede="পরিসংখ্যানের পেছনে মুখ আছে। যাঁদের ঘামে দেশ চলে, সমস্যার প্রথম আঘাত পড়ে তাঁদের ওপর — প্রতিটি ছবির নিচে সেই কষ্ট, আর কোন সমস্যার সাথে তা জড়িত।"
        />

        <ul className="grid auto-rows-[15rem] grid-cols-1 gap-3 sm:grid-cols-2 lg:auto-rows-[13rem] lg:grid-cols-4 lg:grid-flow-dense">
          {ruralStories.map((s, i) => {
            const big = i === 0 || i === 7;
            const tall = i === 3 || i === 10;
            return (
              <li key={s.id} className={cn("group relative overflow-hidden rounded-2xl bg-slate-900", big && "sm:col-span-2 lg:row-span-2", tall && "lg:row-span-2")}>
                <StoryPhoto photo={s.photo} sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"} className="absolute inset-0" />
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/35 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 pb-7">
                  <p className="font-bengali text-xs font-semibold text-signal-orange">{s.place}</p>
                  <p className={cn("mt-1 font-bengali leading-snug text-white", big ? "text-lg sm:text-xl" : "text-[15px]")}>{s.pain}</p>
                  <a href={`#p-${s.problem}`} className="pointer-events-auto mt-2 inline-flex items-center gap-1 rounded font-bengali text-xs font-semibold text-emerald-200 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                    সমস্যা #{toBanglaDigits(s.problem)} <Icon name="arrow_forward" className="text-[14px]" />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-12">
          <h3 className="flex items-center gap-2 font-bengali text-xl font-bold text-signal-orange">
            <Icon name="add_a_photo" className="text-[24px]" /> মাঠ থেকে আমাদের নিজের ছবি
          </h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {OWN_FRAMES.map((f) => (
              <li key={f.title} className="relative flex aspect-4/3 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/25 bg-text-primary p-6 text-center">
                <Icon name="photo_camera" className="text-[36px] text-white/50" />
                <p className="font-bengali text-base font-bold text-white">{f.title}</p>
                <p className="font-bengali text-sm text-white/65">{f.note}</p>
                <span className="absolute top-3 right-3 rounded-full bg-white/10 px-2 py-0.5 font-bengali text-[11px] font-semibold text-white/80">প্লেসহোল্ডার</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
