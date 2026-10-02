import Link from "next/link";
import { CalendarClock, FlaskConical, Leaf, MapPin, PackageCheck, UsersRound } from "lucide-react";
import { MODES, SIDES } from "@/data/media/bazaar";
import type { BoardPost, Person } from "@/data/media/types";
import { poolOrder, unitPrice } from "@/lib/media/bazaar";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Num, Taka } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import type { buyersFor, sellersFor } from "./matching";

type Sellers = ReturnType<typeof sellersFor>;
type Buyers = ReturnType<typeof buyersFor>;

function Score({ score }: { score: number }) {
  return (
    <>
      <span className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-white/10" aria-hidden>
        <span className="meter-fill block h-full rounded-full bg-bdgreen-500" style={{ width: `${score}%` }} />
      </span>
      <span className="w-8 shrink-0 text-right font-bold text-white"><Num value={score} />%</span>
    </>
  );
}

/** For a buy post: who can fill it, and how a big order pools across sellers. */
function SellerMatches({ post, matches }: { post: BoardPost; matches: Sellers }) {
  const pool = poolOrder(matches.map((m) => ({ id: m.o.id, stock: m.o.offer.stock ?? post.qty, price: unitPrice(post.qty, m.o.offer.price, m.o.tiers) })), post.qty);
  return (
    <>
      <p className="flex items-center gap-1.5 text-xs font-bold text-bdgreen-500">
        <PackageCheck className="size-4" aria-hidden /> <Num value={matches.length} /> জন বিক্রেতার সাথে অটো-মিল
      </p>
      <ul className="mt-2 space-y-1.5">
        {matches.slice(0, 3).map((m) => (
          <li key={m.o.id} className="flex items-center gap-2 text-xs">
            <Link href={m.o.href} className="min-w-0 flex-1 truncate font-semibold text-white hover:text-signal-orange">{m.o.title}</Link>
            <Score score={m.score} />
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-white/65">
        {pool.filled < post.qty ? (
          <>এখন পাওয়া যাচ্ছে <Num value={pool.filled} />/<Num value={post.qty} /> {post.unit} — বাকিটা নতুন বিক্রেতা এলে</>
        ) : pool.lots.length > 1 ? (
          <><Num value={pool.lots.length} /> জন বিক্রেতা মিলে পুরোটা — মোট <Taka amount={pool.total} /></>
        ) : (
          <>একজনেই পুরোটা দিতে পারেন — মোট <Taka amount={pool.total} /></>
        )}
      </p>
    </>
  );
}

function BuyerMatches({ matches }: { matches: Buyers }) {
  return (
    <>
      <p className="flex items-center gap-1.5 text-xs font-bold text-bdgreen-500">
        <UsersRound className="size-4" aria-hidden /> <Num value={matches.length} /> জন ক্রেতা এটাই খুঁজছেন
      </p>
      <ul className="mt-2 space-y-1.5">
        {matches.slice(0, 3).map((m) => (
          <li key={m.post.id} className="flex items-center gap-2 text-xs">
            <Link href={`/media/market?view=board#${m.post.id}`} className="min-w-0 flex-1 truncate font-semibold text-white hover:text-signal-orange">{m.post.title}</Link>
            <Score score={m.score} />
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * One চাহিদা বোর্ড post. A buy post shows the sellers who can fill it; a sell
 * post shows the buyers already looking. Either way the reply is a post on
 * the other side, prefilled.
 */
export function BoardCard({ post: p, author, sellers = [], buyers = [], mine }: { post: BoardPost; author: Person; sellers?: Sellers; buyers?: Buyers; mine?: boolean }) {
  const buy = p.side === "buy";
  const count = buy ? sellers.length : buyers.length;
  return (
    <article className={cn("story-reveal flex h-full flex-col gap-4 rounded-2xl bg-text-primary p-4 ring-1 transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0", buy ? "ring-signal-orange/30 hover:shadow-[0_24px_44px_-26px_var(--color-signal-orange)]" : "ring-bdgreen-500/30 hover:shadow-[0_24px_44px_-26px_var(--color-bdgreen-500)]")}>
      <header className="flex items-start gap-3">
        <PersonAvatar person={author} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-white/65">
            <span className="font-semibold text-white">{mine ? "আপনার পোস্ট" : author.nameBn}</span> · {p.who}
          </p>
          <h3 className="mt-0.5 text-[15px] leading-snug font-bold text-white">{p.title}</h3>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold", buy ? "bg-signal-orange text-text-primary" : "bg-bd-green text-white")}>{SIDES[p.side].bn}</span>
      </header>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-white/10 px-3 py-2">
          <dt className="text-[11px] text-white/65">{buy ? "দরকার" : "আছে"}</dt>
          <dd className="font-bold text-white"><Num value={p.qty} /> {p.unit}</dd>
        </div>
        <div className="rounded-xl bg-white/10 px-3 py-2">
          <dt className="text-[11px] text-white/65">{buy ? "সর্বোচ্চ দর" : "দাম"}</dt>
          <dd className="font-bold text-signal-orange">{p.price ? <><Taka amount={p.price} /><span className="text-xs font-normal text-white/65"> / {p.unit}</span></> : "আলোচনায়"}</dd>
        </div>
      </dl>

      <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/70">
        <span className="font-semibold text-white/85">{MODES[p.mode].bn}</span>
        <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{p.district}</span>
        <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" aria-hidden />{p.when}</span>
        {p.organic && <span className="inline-flex items-center gap-1 text-bdgreen-500"><Leaf className="size-3.5" aria-hidden />{buy ? "শুধু বিষমুক্ত" : "বিষমুক্ত"}</span>}
        {p.sampleTest && <span className="inline-flex items-center gap-1 text-signal-orange"><FlaskConical className="size-3.5" aria-hidden />আগে নমুনা ও ল্যাব টেস্ট</span>}
      </p>
      {p.note && <p className="text-sm leading-relaxed text-white/80">{p.note}</p>}
      <p className="flex flex-wrap gap-1.5">
        {p.tags.map((t) => (
          <span key={t} className="rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-white/80">#{t}</span>
        ))}
      </p>

      <div className="mt-auto rounded-xl border border-dashed border-white/20 p-3">
        {count === 0 ? (
          <p className="text-xs text-white/65">{buy ? "এখনো বিক্রেতা মেলেনি" : "এখনো ক্রেতা মেলেনি"} — নতুন পোস্ট এলেই অটো-মিল হবে।</p>
        ) : buy ? (
          <SellerMatches post={p} matches={sellers} />
        ) : (
          <BuyerMatches matches={buyers} />
        )}
      </div>

      {!mine && (
        <Link href={`/media/market/board/new?side=${buy ? "sell" : "buy"}&for=${p.id}`} className={mediaButton({ variant: buy ? "green" : "primary", size: "sm", className: "w-full" })}>
          {buy ? "আমার কাছে আছে — বিক্রির পোস্ট দিন" : "আমি কিনব — কেনার পোস্ট দিন"}
        </Link>
      )}
    </article>
  );
}
