"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, BadgeCheck, Bell, Check, Gamepad2, KeyRound, LogOut, Mail, MapPin, PartyPopper, Phone, RotateCcw, Save, Sparkles, Trash2, UsersRound } from "lucide-react";
import { AccountAvatar } from "@/components/auth/account-menu";
import { Chip, FieldError, PasswordField, TextField, Toggle } from "@/components/auth/fields";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { announcementKinds, announcements } from "@/data/announcements";
import { FOLLOWABLE_PRODUCTS, ROLES, SECTORS, type Account, type RoleId, type SectorId } from "@/data/auth";
import { districts } from "@/data/districts";
import { changePassword, deleteAccount, resetDemoAccounts, signOut, updateAccount, useAuth, type ActionResult } from "@/lib/auth/client";
import { formatPhone } from "@/lib/auth/validate";
import { cn } from "@/lib/utils";

const METHOD_BN = { otp: "মোবাইল কোড", password: "পাসওয়ার্ড", link: "ইমেইল লিংক", signup: "নতুন অ্যাকাউন্ট" } as const;

const dateBn = (iso: string | number) => new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });

const card = "rounded-2xl border border-card-border bg-white p-space-lg shadow-clean";
const h2 = "flex items-center gap-space-sm font-display text-headline-sm font-bold text-text-primary";
const btn = "inline-flex min-h-11 items-center justify-center gap-space-xs rounded-lg px-space-md font-sans text-body-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-bd-green/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export function AccountDashboard() {
  const { account, session } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  if (!account || !session) return null; // the route guard shows the loading state

  const role = ROLES.find((r) => r.id === account.role);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-space-lg px-gutter-x py-space-xl">
      {params.get("welcome") ? <Welcome account={account} /> : null}

      <section aria-labelledby="account-title" className={cn(card, "flex flex-col gap-space-lg md:flex-row md:items-center")}>
        <AccountAvatar name={account.name} className="size-20 shrink-0 text-3xl" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-label-xs font-bold tracking-widest text-bd-green uppercase">Kandari Profile</p>
          <h1 id="account-title" className="mt-1 font-display text-headline-md font-bold text-text-primary">
            {account.name}
          </h1>
          <ul className="mt-space-sm flex flex-wrap gap-x-space-lg gap-y-1 font-sans text-body-sm text-text-secondary">
            <li className="flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-bd-green" aria-hidden /> {role?.bn}
            </li>
            <li className="flex items-center gap-1.5">
              <Phone className="size-4 text-bd-green" aria-hidden /> {formatPhone(account.phone)} <span className="rounded bg-bd-green-light px-1.5 text-xs font-semibold text-bd-green-dark">যাচাইকৃত</span>
            </li>
            {account.email ? (
              <li className="flex items-center gap-1.5">
                <Mail className="size-4 text-bd-green" aria-hidden /> {account.email}
              </li>
            ) : null}
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4 text-bd-green" aria-hidden /> {account.district}
            </li>
          </ul>
          <p className="mt-space-sm font-sans text-body-sm text-text-muted">
            সদস্য {dateBn(account.createdAt)} থেকে · এই ডিভাইসে সাইন ইন: {METHOD_BN[session.method]}, {dateBn(session.at)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            signOut();
            router.push("/");
          }}
          className={cn(btn, "border border-card-border text-text-secondary hover:border-red-200 hover:bg-red-50 hover:text-national-crimson")}
        >
          <LogOut className="size-4" aria-hidden /> সাইন আউট
        </button>
      </section>

      <div className="grid gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-7">
          <Updates account={account} />
          <Interests key={`i-${account.id}`} account={account} />
          <ProfileDetails key={`p-${account.id}`} account={account} />
        </div>
        <div className="flex flex-col gap-space-lg lg:col-span-5">
          <Places account={account} />
          <Notifications account={account} />
          <Security />
          <DangerZone demo={!!account.demo} />
        </div>
      </div>
    </div>
  );
}

function Welcome({ account }: { account: Account }) {
  return (
    <section role="status" className="flex flex-col gap-space-md rounded-2xl bg-bd-green p-space-lg text-white sm:flex-row sm:items-center">
      <PartyPopper className="size-10 shrink-0 text-signal-orange" aria-hidden />
      <div className="flex-1 font-sans">
        <p className="text-headline-sm font-bold">স্বাগতম, {account.name}!</p>
        <p className="mt-1 text-body-md text-white/85">অ্যাকাউন্ট তৈরি হয়েছে। বাছাই করা খাত ও পণ্যের খবর নিচে পাবেন — চাইলে এখনই দক্ষতা-প্রোফাইল খুলে কাজও খুঁজতে পারেন।</p>
      </div>
      <Link href="/media/onboarding" className={cn(btn, "bg-signal-orange text-text-primary hover:brightness-95")}>
        দক্ষতা-প্রোফাইল খুলুন <ArrowRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}

/** Announcements for this account's sectors and products first, then the rest. */
function Updates({ account }: { account: Account }) {
  const scored = announcements
    .map((a, i) => {
      const hits = (a.sectors ?? []).filter((s) => account.sectors.includes(s)).length + 2 * (a.products ?? []).filter((p) => account.products.includes(p)).length;
      return { a, i, hits };
    })
    .sort((x, y) => y.hits - x.hits || x.i - y.i)
    .slice(0, 5);
  return (
    <section aria-labelledby="updates-title" className={card}>
      <h2 id="updates-title" className={h2}>
        <Sparkles className="size-5 text-signal-orange" aria-hidden /> আপনার জন্য আপডেট
      </h2>
      <ul className="mt-space-md divide-y divide-card-border">
        {scored.map(({ a, hits }) => {
          const kind = announcementKinds[a.kind];
          return (
            <li key={a.id}>
              <Link href={a.href} className="group flex items-start gap-space-sm py-space-sm">
                <span className={cn("mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-sans text-xs font-semibold", kind.chip)}>
                  <Icon name={kind.icon} className="text-[14px]" />
                  {kind.label}
                </span>
                <span className="flex-1 font-sans text-body-md text-text-primary group-hover:text-bd-green">
                  {a.text}
                  {hits > 0 ? <span className="ml-space-xs rounded bg-amber-50 px-1.5 text-xs font-semibold text-amber-800">আপনার আগ্রহে</span> : null}
                </span>
                <ArrowRight className="mt-1 size-4 shrink-0 text-text-muted group-hover:text-bd-green" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function useSave() {
  const [state, setState] = useState<{ busy: boolean; error?: string; saved?: boolean }>({ busy: false });
  async function save(p: () => Promise<ActionResult<unknown>>) {
    setState({ busy: true });
    const r = await p();
    setState(r.ok ? { busy: false, saved: true } : { busy: false, error: r.message });
  }
  return { ...state, save, dirty: () => setState({ busy: false }) };
}

function SaveRow({ busy, saved, error, disabled }: { busy: boolean; saved?: boolean; error?: string; disabled?: boolean }) {
  return (
    <div className="mt-space-md flex flex-wrap items-center gap-space-md">
      <button type="submit" disabled={busy || disabled} className={cn(btn, "bg-bd-green text-white hover:bg-bd-green-dark")}>
        <Save className="size-4" aria-hidden /> {busy ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
      </button>
      {saved ? (
        <span role="status" className="flex items-center gap-1 font-sans text-body-sm font-semibold text-bd-green">
          <Check className="size-4" aria-hidden /> সংরক্ষিত
        </span>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function Interests({ account }: { account: Account }) {
  const [sectors, setSectors] = useState<SectorId[]>(account.sectors);
  const [products, setProducts] = useState<string[]>(account.products);
  const s = useSave();
  const changed = sectors.join() !== account.sectors.join() || products.join() !== account.products.join();
  return (
    <section aria-labelledby="interests-title" className={card}>
      <h2 id="interests-title" className={h2}>
        <Icon name="interests" className="text-[22px] text-bd-green" /> আগ্রহ ও অনুসরণ
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          s.save(() => updateAccount({ sectors, products }));
        }}
      >
        <fieldset className="mt-space-md">
          <legend className="mb-space-sm font-sans text-label-sm font-semibold tracking-wide text-text-secondary">খাত</legend>
          <div className="flex flex-wrap gap-space-xs">
            {SECTORS.map((x) => (
              <Chip key={x.id} on={sectors.includes(x.id)} onChange={() => { setSectors((v) => toggle(v, x.id)); s.dirty(); }}>
                {x.bn}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-space-md">
          <legend className="mb-space-sm font-sans text-label-sm font-semibold tracking-wide text-text-secondary">পণ্য</legend>
          <div className="flex flex-wrap gap-space-xs">
            {FOLLOWABLE_PRODUCTS.map((p) => (
              <Chip key={p.slug} on={products.includes(p.slug)} onChange={() => { setProducts((v) => toggle(v, p.slug)); s.dirty(); }}>
                {p.bn} <span className="font-normal opacity-70">{p.en}</span>
              </Chip>
            ))}
          </div>
        </fieldset>
        <SaveRow busy={s.busy} saved={s.saved} error={s.error} disabled={!changed} />
      </form>
    </section>
  );
}

function ProfileDetails({ account }: { account: Account }) {
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email ?? "");
  const [role, setRole] = useState<RoleId>(account.role);
  const [district, setDistrict] = useState(account.district);
  const s = useSave();
  const changed = name !== account.name || email !== (account.email ?? "") || role !== account.role || district !== account.district;
  return (
    <section aria-labelledby="details-title" className={card}>
      <h2 id="details-title" className={h2}>
        <Icon name="badge" className="text-[22px] text-bd-green" /> প্রোফাইল তথ্য
      </h2>
      <form
        className="mt-space-md grid gap-space-md sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          s.save(() => updateAccount({ name, email: email.trim() || null, role, district }));
        }}
        onChange={() => s.dirty()}
      >
        <TextField label="পূর্ণ নাম" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="ইমেইল" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} hint="খালি রাখলে ইমেইলে সাইন ইন ও খবর বন্ধ থাকবে।" />
        <div className="grid gap-space-sm">
          <Label htmlFor="acc-role">আপনি কে</Label>
          <select id="acc-role" value={role} onChange={(e) => setRole(e.target.value as RoleId)} className="h-11 rounded-lg border border-card-border bg-white px-space-md font-sans text-body-md shadow-clean focus-visible:border-bd-green focus-visible:ring-2 focus-visible:ring-bd-green/20 focus-visible:outline-none">
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.bn}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-space-sm">
          <Label htmlFor="acc-district">জেলা</Label>
          <select id="acc-district" value={district} onChange={(e) => setDistrict(e.target.value)} className="h-11 rounded-lg border border-card-border bg-white px-space-md font-sans text-body-md shadow-clean focus-visible:border-bd-green focus-visible:ring-2 focus-visible:ring-bd-green/20 focus-visible:outline-none">
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <p className="font-sans text-body-sm text-text-muted sm:col-span-2">মোবাইল নম্বর ({formatPhone(account.phone)}) অ্যাকাউন্টের পরিচয় — বদলাতে নতুন অ্যাকাউন্ট খুলতে হবে।</p>
        <div className="sm:col-span-2">
          <SaveRow busy={s.busy} saved={s.saved} error={s.error} disabled={!changed} />
        </div>
      </form>
    </section>
  );
}

function Places({ account }: { account: Account }) {
  const followed = FOLLOWABLE_PRODUCTS.filter((p) => account.products.includes(p.slug));
  const link = "group flex items-center gap-space-sm rounded-xl border border-card-border p-space-sm transition-colors hover:border-bd-green/40 hover:bg-mint-subtle";
  return (
    <section aria-labelledby="places-title" className={card}>
      <h2 id="places-title" className={h2}>
        <Icon name="apps" className="text-[22px] text-bd-green" /> আপনার জায়গাগুলো
      </h2>
      <ul className="mt-space-md grid gap-space-sm">
        <li>
          <Link href="/media/me" className={link}>
            <UsersRound className="size-5 shrink-0 text-bd-green" aria-hidden />
            <span className="flex-1 font-sans">
              <span className="block text-body-md font-semibold text-text-primary">শিক্ষিতদের মিডিয়া</span>
              <span className="block text-body-sm text-text-muted">{account.mediaHandle ? `@${account.mediaHandle} — দক্ষতা, রেটিং, কাজ` : "দক্ষতা-প্রোফাইল খুলুন, কাজ পান"}</span>
            </span>
            <ArrowRight className="size-4 text-text-muted group-hover:text-bd-green" aria-hidden />
          </Link>
        </li>
        <li>
          <Link href="/cholo-bangladesh-gori/profile" className={link}>
            <Gamepad2 className="size-5 shrink-0 text-bd-green" aria-hidden />
            <span className="flex-1 font-sans">
              <span className="block text-body-md font-semibold text-text-primary">চলো বাংলাদেশ গড়ি</span>
              <span className="block text-body-sm text-text-muted">খেলার স্তর, অর্জন ও মিশনের ফল</span>
            </span>
            <ArrowRight className="size-4 text-text-muted group-hover:text-bd-green" aria-hidden />
          </Link>
        </li>
        {followed.map((p) => (
          <li key={p.slug}>
            <Link href={`/products/${p.slug}`} className={link}>
              <Icon name="deployed_code" className="text-[20px] text-bd-green" />
              <span className="flex-1 font-sans">
                <span className="block text-body-md font-semibold text-text-primary">{p.bn}</span>
                <span className="block text-body-sm text-text-muted">{p.en} — অনুসরণ করছেন</span>
              </span>
              <ArrowRight className="size-4 text-text-muted group-hover:text-bd-green" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Notifications({ account }: { account: Account }) {
  const [error, setError] = useState<string>();
  const set = async (patch: Partial<Account["notify"]>) => {
    const r = await updateAccount({ notify: { ...account.notify, ...patch } });
    setError(r.ok ? undefined : r.message);
  };
  return (
    <section aria-labelledby="notify-title" className={card}>
      <h2 id="notify-title" className={h2}>
        <Bell className="size-5 text-bd-green" aria-hidden /> কীভাবে জানাব
      </h2>
      <div className="mt-space-md grid gap-space-xs">
        <Toggle checked={account.notify.sms} onChange={(v) => set({ sms: v })} label={`এসএমএস — ${formatPhone(account.phone)}`} />
        <Toggle checked={account.notify.email && !!account.email} disabled={!account.email} onChange={(v) => set({ email: v })} label={account.email ? `ইমেইল — ${account.email}` : "ইমেইল (প্রোফাইলে ইমেইল যোগ করুন)"} />
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
      <p className="mt-space-sm font-sans text-body-sm text-text-muted">ডেমো: বার্তা আসলে পাঠানো হয় না, পছন্দটি শুধু সংরক্ষিত থাকে।</p>
    </section>
  );
}

function Security() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const s = useSave();
  return (
    <section aria-labelledby="security-title" className={card}>
      <h2 id="security-title" className={h2}>
        <KeyRound className="size-5 text-bd-green" aria-hidden /> পাসওয়ার্ড বদলান
      </h2>
      <form
        className="mt-space-md grid gap-space-md"
        onSubmit={async (e) => {
          e.preventDefault();
          await s.save(async () => {
            const r = await changePassword(current, next);
            if (r.ok) {
              setCurrent("");
              setNext("");
            }
            return r;
          });
        }}
      >
        <PasswordField label="বর্তমান পাসওয়ার্ড" autoComplete="current-password" value={current} onChange={(e) => { setCurrent(e.target.value); s.dirty(); }} />
        <PasswordField label="নতুন পাসওয়ার্ড" autoComplete="new-password" value={next} onChange={(e) => { setNext(e.target.value); s.dirty(); }} showRules />
        <SaveRow busy={s.busy} saved={s.saved} error={s.error} disabled={!current || !next} />
      </form>
    </section>
  );
}

function DangerZone({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  return (
    <section aria-labelledby="danger-title" className={cn(card, "border-red-200")}>
      <h2 id="danger-title" className={h2}>
        <Trash2 className="size-5 text-national-crimson" aria-hidden /> অ্যাকাউন্ট মুছুন
      </h2>
      <p className="mt-space-sm font-sans text-body-sm text-text-secondary">অ্যাকাউন্ট, আগ্রহ ও নোটিফিকেশনের পছন্দ স্থায়ীভাবে মুছে যাবে।{demo ? " (ডেমো অ্যাকাউন্ট — নিচের বোতামে আবার ফিরিয়ে আনা যায়।)" : ""}</p>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className={cn(btn, "mt-space-md border border-red-200 text-national-crimson hover:bg-red-50")}>
          <Trash2 className="size-4" aria-hidden /> অ্যাকাউন্ট মুছুন…
        </button>
      ) : (
        <form
          className="mt-space-md grid gap-space-md"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const r = await deleteAccount(password);
            setBusy(false);
            if (r.ok) router.push("/");
            else setError(r.message);
          }}
        >
          <PasswordField label="নিশ্চিত করতে পাসওয়ার্ড দিন" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={error} autoFocus />
          <div className="flex flex-wrap gap-space-sm">
            <button type="submit" disabled={busy || !password} className={cn(btn, "bg-national-crimson text-white hover:bg-red-700")}>
              {busy ? "মুছে ফেলা হচ্ছে…" : "স্থায়ীভাবে মুছুন"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setPassword(""); setError(undefined); }} className={cn(btn, "border border-card-border text-text-secondary hover:bg-slate-50")}>
              বাতিল
            </button>
          </div>
        </form>
      )}
      <button
        type="button"
        onClick={() => {
          resetDemoAccounts();
          router.push("/login");
        }}
        className={cn(btn, "mt-space-sm text-text-muted hover:text-text-primary")}
      >
        <RotateCcw className="size-4" aria-hidden /> ডেমো অ্যাকাউন্টগুলো আগের অবস্থায় ফেরান (৩টি)
      </button>
    </section>
  );
}
