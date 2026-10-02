"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Dialog } from "radix-ui";
import { ArrowRight, BadgeCheck, Bell, Camera, Check, Gamepad2, ImagePlus, KeyRound, LogOut, Mail, MapPin, PartyPopper, PencilLine, Phone, RotateCcw, Save, Sparkles, Trash2, UsersRound, X } from "lucide-react";
import { AccountAvatar } from "@/components/auth/account-menu";
import { FieldError, PasswordField } from "@/components/auth/fields";
import { Icon } from "@/components/ui/icon";
import { PixelMark, SignalSeam, btn as kit } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { announcementKinds, announcements } from "@/data/announcements";
import { FOLLOWABLE_PRODUCTS, ROLES, SECTORS, type Account, type RoleId, type SectorId } from "@/data/auth";
import { districts } from "@/data/districts";
import { changePassword, deleteAccount, resetDemoAccounts, signOut, updateAccount, useAuth, type ActionResult } from "@/lib/auth/client";
import { PHOTO_MAX_CHARS } from "@/lib/auth/core";
import { formatPhone, toBanglaDigits } from "@/lib/auth/validate";
import { cn } from "@/lib/utils";

const METHOD_BN = { otp: "মোবাইল কোড", password: "পাসওয়ার্ড", link: "ইমেইল লিংক", signup: "নতুন অ্যাকাউন্ট" } as const;

const dateBn = (iso: string | number) => new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });

/** Ink card on the black ground, the home page's panel. */
const card = "story-reveal rounded-3xl bg-text-primary p-5 text-white ring-1 ring-white/12 sm:p-7";
const h2 = "flex items-center gap-2.5 font-bengali text-2xl font-bold text-signal-orange";
const press = "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,background-color,box-shadow] duration-200 active:scale-95 motion-reduce:transition-none";
const action = cn(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-sans text-sm font-bold focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  press,
);

/**
 * Turns a picked image into a small square JPEG data URL: centre-cropped,
 * 320px, so it stays well inside browser storage and the account's
 * `PHOTO_MAX_CHARS`. Nothing is uploaded anywhere — the mock gateway keeps
 * it in this browser, like the rest of the account.
 */
async function toAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("type");
  if (file.size > 12 * 1024 * 1024) throw new Error("size");
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  // Keep the top of a portrait (faces sit high), centre a landscape.
  const sx = (bmp.width - side) / 2;
  const sy = bmp.height > bmp.width ? Math.min((bmp.height - side) / 2, bmp.height * 0.08) : (bmp.height - side) / 2;
  ctx.drawImage(bmp, sx, sy, side, side, 0, 0, 320, 320);
  bmp.close();
  for (const q of [0.86, 0.72, 0.55]) {
    const url = canvas.toDataURL("image/jpeg", q);
    if (url.length <= PHOTO_MAX_CHARS) return url;
  }
  throw new Error("size");
}

const PHOTO_ERR = "ছবিটি নেওয়া গেল না — JPG, PNG বা WebP ছবি দিন (১২ MB-এর কম)।";

export function AccountDashboard() {
  const { account, session } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const editParam = params.get("edit") === "1";
  const [editOpen, setEditOpen] = useState(false);
  if (!account || !session) return null; // the route guard shows the loading state

  const open = editOpen || editParam;
  const setOpen = (v: boolean) => {
    setEditOpen(v);
    if (!v && editParam) router.replace("/account", { scroll: false });
  };

  return (
    <>
      <ProfileHero account={account} sessionMethod={session.method} sessionAt={session.at} onEdit={() => setOpen(true)} />
      <EditProfile key={`${account.id}-${open}`} account={account} open={open} onOpenChange={setOpen} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-gutter-x py-12 sm:py-16">
        {params.get("welcome") ? <Welcome account={account} /> : null}

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <Updates account={account} />
            <Interests key={`i-${account.id}`} account={account} />
          </div>
          <div className="flex flex-col gap-5 lg:col-span-5">
            <Places account={account} />
            <Notifications account={account} />
            <Security />
            <DangerZone demo={!!account.demo} />
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * The profile hero, in the home hero's frame: the `hero-band` on ink, the
 * picture at the centre of its own small orbit with a camera button to
 * change it in one tap, the name and details beside it, and the ink proof
 * strip with the gold pulse closing the band.
 */
function ProfileHero({
  account,
  sessionMethod,
  sessionAt,
  onEdit,
}: {
  account: Account;
  sessionMethod: keyof typeof METHOD_BN;
  sessionAt: number;
  onEdit: () => void;
}) {
  const router = useRouter();
  const inputId = useId();
  const [photoState, setPhotoState] = useState<{ busy: boolean; error?: string }>({ busy: false });
  const role = ROLES.find((r) => r.id === account.role);

  async function pick(file: File | undefined) {
    if (!file) return;
    setPhotoState({ busy: true });
    try {
      const photo = await toAvatar(file);
      const r = await updateAccount({ photo });
      setPhotoState(r.ok ? { busy: false } : { busy: false, error: r.message });
    } catch {
      setPhotoState({ busy: false, error: PHOTO_ERR });
    }
  }

  const stats = [
    { label: "খাত", value: toBanglaDigits(account.sectors.length) },
    { label: "অনুসরণ করা পণ্য", value: toBanglaDigits(account.products.length) },
    { label: "সদস্য", value: dateBn(account.createdAt) },
    { label: "এই ডিভাইসে সাইন ইন", value: METHOD_BN[sessionMethod] },
  ];

  return (
    <section aria-labelledby="account-title" className="relative w-full">
      <div className="hero-band relative isolate flex w-full items-center overflow-hidden bg-text-primary">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-gutter-x py-12 md:grid-cols-[auto_minmax(0,1fr)] md:gap-14">
          {/* The picture, in its own orbit, with the camera button. */}
          <div className="relative mx-auto grid size-60 place-items-center sm:size-64">
            <span aria-hidden className="orbit-halo absolute inset-10 rounded-full border-2 border-signal-orange" />
            <span
              aria-hidden
              className="orbit-spin absolute inset-3 rounded-full border-[3px] border-transparent border-t-signal-orange border-l-signal-orange"
              style={{ filter: "drop-shadow(0 0 6px var(--color-signal-orange))" }}
            />
            <span
              aria-hidden
              className="orbit-spin-rev absolute inset-0 rounded-full border-2 border-transparent border-r-bdgreen-500 border-b-bdgreen-500"
              style={{ filter: "drop-shadow(0 0 6px var(--color-bdgreen-500))" }}
            />
            <span className="relative rounded-full bg-signal-orange p-1 shadow-[0_0_60px_-8px_var(--color-signal-orange)]">
              <AccountAvatar name={account.name} photo={account.photo} sizes="176px" className="size-40 text-6xl sm:size-44" />
              {photoState.busy ? (
                <span className="absolute inset-1 grid place-items-center rounded-full bg-black/60">
                  <span className="size-8 animate-spin rounded-full border-4 border-white/25 border-t-signal-orange motion-reduce:animate-none" aria-hidden />
                </span>
              ) : null}
            </span>
            <label
              htmlFor={inputId}
              title="ছবি বদলান"
              className={cn(
                "absolute right-7 bottom-7 grid size-12 cursor-pointer place-items-center rounded-full bg-signal-orange text-text-primary shadow-[0_10px_24px_-8px_rgb(0_0_0/0.8)] ring-4 ring-text-primary hover:-translate-y-0.5 has-focus-visible:ring-white",
                press,
              )}
            >
              <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
              <Camera className="size-5" aria-hidden />
              <span className="sr-only">প্রোফাইল ছবি বদলান</span>
            </label>
          </div>

          <div className="flex min-w-0 flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-mono text-xs font-bold tracking-widest text-signal-orange uppercase">
              <PixelMark tone="dark" className="py-0" />
              Kandari Profile
            </span>
            <h1 id="account-title" className="font-bengali text-4xl leading-tight font-bold text-white sm:text-5xl">
              {account.name}
            </h1>
            <ul className="flex flex-wrap gap-2 font-sans text-sm">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-signal-orange px-3 py-1 font-bengali font-bold text-text-primary">
                <BadgeCheck className="size-4" aria-hidden /> {role?.bn}
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-white ring-1 ring-white/20">
                <Phone className="size-4 text-signal-orange" aria-hidden /> {formatPhone(account.phone)}
                <span className="rounded-full bg-bdgreen-500 px-1.5 font-bengali text-[11px] font-bold text-text-primary">যাচাইকৃত</span>
              </li>
              {account.email ? (
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-white ring-1 ring-white/20">
                  <Mail className="size-4 text-signal-orange" aria-hidden /> {account.email}
                </li>
              ) : null}
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-bengali text-white ring-1 ring-white/20">
                <MapPin className="size-4 text-signal-orange" aria-hidden /> {account.district}
              </li>
            </ul>
            {photoState.error ? <p role="alert" className="live-in rounded-xl bg-national-crimson px-3 py-2 font-bengali text-sm text-white">{photoState.error}</p> : null}
            <div className="flex flex-wrap gap-3 pt-1">
              <button type="button" onClick={onEdit} className={cn(kit.gold, "font-bengali text-sm normal-case")}>
                <PencilLine className="size-4" aria-hidden /> প্রোফাইল সম্পাদনা
              </button>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                className={cn(kit.ghost, "font-bengali text-sm normal-case hover:bg-national-crimson")}
              >
                <LogOut className="size-4" aria-hidden /> সাইন আউট
              </button>
            </div>
            <p className="font-bengali text-xs text-white/60">শেষ সাইন ইন: {dateBn(sessionAt)}</p>
          </div>
        </div>
      </div>

      <div className="relative w-full bg-text-primary">
        <SignalSeam className="top-0" />
        <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 px-space-sm py-space-md text-center max-lg:nth-[2n+1]:border-l-0 max-lg:nth-[n+3]:border-t max-lg:nth-[n+3]:border-white/10"
            >
              <dt className="font-bengali text-xs font-medium text-white/65">{s.label}</dt>
              <dd className="font-bengali text-lg font-bold text-signal-orange sm:text-xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Ink field on the gold panel. */
const panelField =
  "h-12 w-full rounded-xl bg-text-primary px-3.5 font-sans text-body-md text-white ring-1 ring-text-primary outline-none placeholder:text-white/40 transition-[box-shadow] duration-200 focus:ring-2 focus:ring-white";

/**
 * Edit profile — the Record panel's gold side sheet, snapping in from the
 * right. The picture (upload, or back to the placeholder) and the details
 * are saved together.
 */
function EditProfile({ account, open, onOpenChange }: { account: Account; open: boolean; onOpenChange: (v: boolean) => void }) {
  const inputId = useId();
  const [photo, setPhoto] = useState<string | null>(account.photo ?? null);
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email ?? "");
  const [role, setRole] = useState<RoleId>(account.role);
  const [district, setDistrict] = useState(account.district);
  const [institution, setInstitution] = useState(account.institution ?? "");
  const [photoError, setPhotoError] = useState<string>();
  const s = useSave();
  const changed =
    (photo ?? null) !== (account.photo ?? null) || name !== account.name || email !== (account.email ?? "") || role !== account.role || district !== account.district || institution.trim() !== (account.institution ?? "");
  const item = (i: number) => ({ "--i": i }) as CSSProperties;

  async function pick(file: File | undefined) {
    if (!file) return;
    setPhotoError(undefined);
    try {
      setPhoto(await toAvatar(file));
      s.dirty();
    } catch {
      setPhotoError(PHOTO_ERR);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="record-veil fixed inset-0 z-[60] bg-black/60" />
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).focus();
          }}
          className="record-panel fixed inset-y-2 right-2 z-[60] flex w-[min(30rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-3xl bg-signal-orange text-text-primary shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] focus:outline-none sm:inset-y-3 sm:right-3"
        >
          <form
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-5"
            onSubmit={(e) => {
              e.preventDefault();
              s.save(() => updateAccount({ photo, name, email: email.trim() || null, role, district, institution: institution.trim() || null }));
            }}
          >
            <div className="record-item flex items-start justify-between gap-3" style={item(0)}>
              <div>
                <PixelMark tone="light" />
                <Dialog.Title className="mt-2 font-bengali text-3xl leading-tight font-bold">প্রোফাইল সম্পাদনা</Dialog.Title>
                <Dialog.Description className="mt-1 font-sans text-sm text-text-primary/85">ছবি, নাম আর পরিচয় — এখানে বদলান।</Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="বন্ধ করুন"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-text-primary text-signal-orange transition-[background-color,scale] duration-200 hover:bg-bd-green-dark focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-90"
              >
                <X className="size-5" aria-hidden />
              </Dialog.Close>
            </div>

            {/* Picture. */}
            <div className="record-item mt-5 flex items-center gap-4 rounded-3xl bg-text-primary p-4 text-white" style={item(1)}>
              <span className="rounded-full bg-signal-orange p-1">
                <AccountAvatar name={name || account.name} photo={photo} sizes="96px" className="size-20 text-3xl" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="font-bengali text-sm font-bold">প্রোফাইল ছবি</span>
                <div className="flex flex-wrap gap-2">
                  <label htmlFor={inputId} className={cn(action, "min-h-10 cursor-pointer bg-signal-orange text-text-primary has-focus-visible:ring-2 has-focus-visible:ring-white")}>
                    <input id={inputId} type="file" accept="image/*" className="sr-only" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
                    <ImagePlus className="size-4" aria-hidden /> <span className="font-bengali">{photo ? "ছবি বদলান" : "ছবি যোগ করুন"}</span>
                  </label>
                  {photo ? (
                    <button type="button" onClick={() => { setPhoto(null); s.dirty(); }} className={cn(action, "min-h-10 bg-white/10 text-white hover:bg-national-crimson")}>
                      <Trash2 className="size-4" aria-hidden /> <span className="font-bengali">সরান</span>
                    </button>
                  ) : null}
                </div>
                <span className="font-sans text-[11px] text-white/65">JPG, PNG বা WebP · বর্গাকারে কেটে ছোট করে এই ব্রাউজারেই রাখা হয়।</span>
              </div>
            </div>
            {photoError ? <p role="alert" className="mt-2 rounded-xl bg-national-crimson px-3 py-2 font-bengali text-sm text-white">{photoError}</p> : null}

            {/* Details. */}
            <div className="record-item mt-5 grid gap-4" style={item(2)}>
              <label className="grid gap-1.5">
                <span className="font-bengali text-sm font-bold">পূর্ণ নাম</span>
                <input autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); s.dirty(); }} className={panelField} />
              </label>
              <label className="grid gap-1.5">
                <span className="font-bengali text-sm font-bold">ইমেইল</span>
                <input type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); s.dirty(); }} className={panelField} />
                <span className="font-bengali text-xs text-text-primary/75">খালি রাখলে ইমেইলে সাইন ইন ও খবর বন্ধ থাকবে।</span>
              </label>
              <label className="grid gap-1.5">
                <span className="font-bengali text-sm font-bold">স্কুল / কলেজ / বিশ্ববিদ্যালয়</span>
                <input autoComplete="organization" maxLength={120} placeholder="যেমন: University of Asia Pacific" value={institution} onChange={(e) => { setInstitution(e.target.value); s.dirty(); }} className={panelField} />
                <span className="font-bengali text-xs text-text-primary/75">ক্লাসরুমে নামের নিচে দেখাবে।</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5">
                  <span className="font-bengali text-sm font-bold">আপনি কে</span>
                  <select value={role} onChange={(e) => { setRole(e.target.value as RoleId); s.dirty(); }} className={cn(panelField, "font-bengali")}>
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.bn}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="font-bengali text-sm font-bold">জেলা</span>
                  <select value={district} onChange={(e) => { setDistrict(e.target.value); s.dirty(); }} className={cn(panelField, "font-bengali")}>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="rounded-xl bg-text-primary/10 px-3 py-2 font-bengali text-xs leading-relaxed">
                মোবাইল নম্বর ({formatPhone(account.phone)}) অ্যাকাউন্টের পরিচয় — বদলাতে নতুন অ্যাকাউন্ট খুলতে হবে।
              </p>
            </div>

            <div className="record-item mt-auto flex flex-wrap items-center gap-3 pt-6" style={item(3)}>
              <button type="submit" disabled={s.busy || !changed} className={cn(action, "min-h-12 flex-1 bg-text-primary text-signal-orange hover:bg-bd-green-dark")}>
                <Save className="size-4" aria-hidden /> <span className="font-bengali">{s.busy ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}</span>
              </button>
              {s.saved ? (
                <span role="status" className="live-in inline-flex items-center gap-1 rounded-full bg-bd-green px-3 py-1.5 font-bengali text-sm font-bold text-white">
                  <Check className="size-4" aria-hidden /> সংরক্ষিত
                </span>
              ) : null}
              {s.error ? <p role="alert" className="w-full rounded-xl bg-national-crimson px-3 py-2 font-bengali text-sm text-white">{s.error}</p> : null}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Welcome({ account }: { account: Account }) {
  return (
    <section role="status" className="story-reveal flex flex-col gap-4 rounded-3xl bg-bd-green p-6 text-white sm:flex-row sm:items-center">
      <PartyPopper className="size-10 shrink-0 text-signal-orange" aria-hidden />
      <div className="flex-1 font-sans">
        <p className="font-bengali text-2xl font-bold">স্বাগতম, {account.name}!</p>
        <p className="mt-1 font-bengali text-base text-white/85">অ্যাকাউন্ট তৈরি হয়েছে। বাছাই করা খাত ও পণ্যের খবর নিচে পাবেন — চাইলে এখনই দক্ষতা-প্রোফাইল খুলে কাজও খুঁজতে পারেন।</p>
      </div>
      <Link href="/media/onboarding" className={cn(kit.gold, "font-bengali text-sm normal-case")}>
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
      <PixelMark tone="dark" />
      <h2 id="updates-title" className={cn(h2, "mt-2")}>
        <Sparkles className="size-6" aria-hidden /> আপনার জন্য আপডেট
      </h2>
      <ul className="mt-4 flex flex-col gap-2">
        {scored.map(({ a, hits }) => {
          const kind = announcementKinds[a.kind];
          return (
            <li key={a.id}>
              <Link href={a.href} className={cn("group flex items-start gap-3 rounded-2xl bg-black p-3 ring-1 ring-white/10 hover:-translate-y-0.5 hover:ring-signal-orange/60", press)}>
                <span className={cn("mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-sans text-xs font-semibold", kind.chip)}>
                  <Icon name={kind.icon} className="text-[14px]" />
                  {kind.label}
                </span>
                <span className="flex-1 font-bengali text-[15px] leading-snug text-white">
                  {a.text}
                  {hits > 0 ? <span className="ml-2 rounded-full bg-signal-orange px-2 py-px text-xs font-bold text-text-primary">আপনার আগ্রহে</span> : null}
                </span>
                <ArrowRight className="mt-1 size-4 shrink-0 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-signal-orange" aria-hidden />
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

function SaveRow({ busy, saved, error, disabled, tone = "gold" }: { busy: boolean; saved?: boolean; error?: string; disabled?: boolean; tone?: "gold" | "ink" }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={busy || disabled}
        className={cn(action, tone === "gold" ? "bg-signal-orange text-text-primary" : "bg-text-primary text-signal-orange hover:bg-bd-green-dark")}
      >
        <Save className="size-4" aria-hidden /> <span className="font-bengali">{busy ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}</span>
      </button>
      {saved ? (
        <span role="status" className="live-in inline-flex items-center gap-1 rounded-full bg-bd-green px-3 py-1 font-bengali text-sm font-bold text-white">
          <Check className="size-4" aria-hidden /> সংরক্ষিত
        </span>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** A chip on ink: gold when chosen, a faint outline when not. */
function DarkChip({ on, onChange, children }: { on: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label
      className={cn(
        "relative inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 font-bengali text-sm font-semibold has-focus-visible:ring-2 has-focus-visible:ring-white",
        press,
        on ? "bg-signal-orange text-text-primary" : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20",
      )}
    >
      <input type="checkbox" checked={on} onChange={onChange} className="sr-only" />
      {on ? <Check className="size-3.5" aria-hidden /> : null}
      {children}
    </label>
  );
}

function Interests({ account }: { account: Account }) {
  const [sectors, setSectors] = useState<SectorId[]>(account.sectors);
  const [products, setProducts] = useState<string[]>(account.products);
  const s = useSave();
  const changed = sectors.join() !== account.sectors.join() || products.join() !== account.products.join();
  return (
    <section aria-labelledby="interests-title" className={card}>
      <PixelMark tone="dark" />
      <h2 id="interests-title" className={cn(h2, "mt-2")}>
        <Icon name="interests" className="text-[26px]" /> আগ্রহ ও অনুসরণ
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          s.save(() => updateAccount({ sectors, products }));
        }}
      >
        <fieldset className="mt-5">
          <legend className="mb-3 font-mono text-[11px] font-bold tracking-widest text-white/75 uppercase">খাত</legend>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((x) => (
              <DarkChip key={x.id} on={sectors.includes(x.id)} onChange={() => { setSectors((v) => toggle(v, x.id)); s.dirty(); }}>
                {x.bn}
              </DarkChip>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="mb-3 font-mono text-[11px] font-bold tracking-widest text-white/75 uppercase">পণ্য</legend>
          <div className="flex flex-wrap gap-2">
            {FOLLOWABLE_PRODUCTS.map((p) => (
              <DarkChip key={p.slug} on={products.includes(p.slug)} onChange={() => { setProducts((v) => toggle(v, p.slug)); s.dirty(); }}>
                {p.bn} <span className="font-sans font-normal opacity-75">{p.en}</span>
              </DarkChip>
            ))}
          </div>
        </fieldset>
        <SaveRow busy={s.busy} saved={s.saved} error={s.error} disabled={!changed} />
      </form>
    </section>
  );
}

/** Your places — solid colour cards that lift on hover and press. */
function Places({ account }: { account: Account }) {
  const followed = FOLLOWABLE_PRODUCTS.filter((p) => account.products.includes(p.slug));
  const places = [
    { href: "/media/me", icon: <UsersRound className="size-5" aria-hidden />, title: "শিক্ষিতদের মিডিয়া", sub: account.mediaHandle ? `@${account.mediaHandle} — দক্ষতা, রেটিং, কাজ` : "দক্ষতা-প্রোফাইল খুলুন, কাজ পান" },
    { href: "/cholo-bangladesh-gori/profile", icon: <Gamepad2 className="size-5" aria-hidden />, title: "চলো বাংলাদেশ গড়ি", sub: "খেলার স্তর, অর্জন ও মিশনের ফল" },
    ...followed.map((p) => ({ href: `/products/${p.slug}`, icon: <Icon name="deployed_code" className="text-[20px]" />, title: p.bn, sub: `${p.en} — অনুসরণ করছেন` })),
  ];
  return (
    <section aria-labelledby="places-title" className={card}>
      <PixelMark tone="dark" />
      <h2 id="places-title" className={cn(h2, "mt-2")}>
        <Icon name="apps" className="text-[26px]" /> আপনার জায়গাগুলো
      </h2>
      <ul className="mt-4 grid gap-2.5">
        {places.map((p, i) => {
          // No ink card on the ink panel: green, gold, orange in turn.
          const t = surfaceAt(i % 3);
          return (
            <li key={p.href}>
              <Link href={p.href} style={glowStyle(t.glow)} className={cn("group flex items-center gap-3 rounded-2xl p-3.5", LIFT, t.card)}>
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none", t.tile)}>{p.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bengali text-base font-bold">{p.title}</span>
                  <span className="block truncate font-bengali text-sm opacity-85">{p.sub}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** A switch on the green card: gold track when on. */
function Switch({ checked, disabled, onChange, label }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className={cn("flex min-h-12 items-center justify-between gap-4 rounded-2xl bg-black/20 px-4 font-bengali text-[15px]", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
      <span className="min-w-0 break-words">{label}</span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-7 w-12 rounded-full bg-white/25 transition-colors peer-checked:bg-signal-orange peer-focus-visible:ring-2 peer-focus-visible:ring-white" />
        <span className="absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-[translate] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] peer-checked:translate-x-5 peer-checked:bg-text-primary motion-reduce:transition-none" />
      </span>
    </label>
  );
}

function Notifications({ account }: { account: Account }) {
  const [error, setError] = useState<string>();
  const set = async (patch: Partial<Account["notify"]>) => {
    const r = await updateAccount({ notify: { ...account.notify, ...patch } });
    setError(r.ok ? undefined : r.message);
  };
  return (
    <section aria-labelledby="notify-title" className="story-reveal rounded-3xl bg-bd-green p-5 text-white sm:p-7">
      <h2 id="notify-title" className="flex items-center gap-2.5 font-bengali text-2xl font-bold">
        <Bell className="size-6 text-signal-orange" aria-hidden /> কীভাবে জানাব
      </h2>
      <div className="mt-4 grid gap-2">
        <Switch checked={account.notify.sms} onChange={(v) => set({ sms: v })} label={`এসএমএস — ${formatPhone(account.phone)}`} />
        <Switch
          checked={account.notify.email && !!account.email}
          disabled={!account.email}
          onChange={(v) => set({ email: v })}
          label={account.email ? `ইমেইল — ${account.email}` : "ইমেইল (প্রোফাইলে ইমেইল যোগ করুন)"}
        />
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
      <p className="mt-3 font-bengali text-sm text-white/80">ডেমো: বার্তা আসলে পাঠানো হয় না, পছন্দটি শুধু সংরক্ষিত থাকে।</p>
    </section>
  );
}

function Security() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const s = useSave();
  return (
    <section aria-labelledby="security-title" className="story-reveal rounded-3xl bg-signal-orange p-5 text-text-primary sm:p-7">
      <h2 id="security-title" className="flex items-center gap-2.5 font-bengali text-2xl font-bold">
        <KeyRound className="size-6" aria-hidden /> পাসওয়ার্ড বদলান
      </h2>
      <form
        className="mt-4 grid gap-4"
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
        <SaveRow busy={s.busy} saved={s.saved} error={s.error} disabled={!current || !next} tone="ink" />
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
    <section aria-labelledby="danger-title" className="story-reveal rounded-3xl bg-text-primary p-5 text-white ring-2 ring-national-crimson/70 sm:p-7">
      <h2 id="danger-title" className="flex items-center gap-2.5 font-bengali text-2xl font-bold text-crimson-bright">
        <Trash2 className="size-6" aria-hidden /> অ্যাকাউন্ট মুছুন
      </h2>
      <p className="mt-2 font-bengali text-sm leading-relaxed text-white/80">
        অ্যাকাউন্ট, আগ্রহ ও নোটিফিকেশনের পছন্দ স্থায়ীভাবে মুছে যাবে।{demo ? " (ডেমো অ্যাকাউন্ট — নিচের বোতামে আবার ফিরিয়ে আনা যায়।)" : ""}
      </p>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className={cn(action, "mt-4 bg-national-crimson text-white")}>
          <Trash2 className="size-4" aria-hidden /> <span className="font-bengali">অ্যাকাউন্ট মুছুন…</span>
        </button>
      ) : (
        <form
          className="mt-4 grid gap-4 rounded-2xl bg-signal-orange p-4 text-text-primary"
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
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy || !password} className={cn(action, "bg-national-crimson text-white")}>
              <span className="font-bengali">{busy ? "মুছে ফেলা হচ্ছে…" : "স্থায়ীভাবে মুছুন"}</span>
            </button>
            <button type="button" onClick={() => { setOpen(false); setPassword(""); setError(undefined); }} className={cn(action, "bg-text-primary text-white")}>
              <span className="font-bengali">বাতিল</span>
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
        className={cn(action, "mt-3 px-0 text-white/70 hover:text-signal-orange")}
      >
        <RotateCcw className="size-4" aria-hidden /> <span className="font-bengali">ডেমো অ্যাকাউন্টগুলো আগের অবস্থায় ফেরান (৩টি)</span>
      </button>
    </section>
  );
}
