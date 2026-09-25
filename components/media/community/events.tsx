"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, CircleCheck, HandHeart, MapPin, Megaphone, PackageOpen, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { districts } from "@/data/media/districts";
import { eventKindBn } from "@/data/media/events";
import type { CommunityEvent, EventKind, Sponsor } from "@/data/media/types";
import { currentUser, getPerson } from "@/data/media/users";
import { eventSchema, sponsorSchema, type EventInput, type SponsorInput } from "@/lib/media/schemas";
import { newId, toggleKey, updateMedia, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass, toNumber } from "../ui/field-styles";
import { DateText, Num } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";

const EMPTY: Sponsor[] = [];

function SponsorDialog({ event, open, onOpenChange }: { event: CommunityEvent; open: boolean; onOpenChange: (o: boolean) => void }) {
  const form = useForm<SponsorInput>({ resolver: zodResolver(sponsorSchema), defaultValues: { name: "", offer: "" } });
  function onSubmit(v: SponsorInput) {
    const s: Sponsor = { name: v.name, offer: v.offer, initials: v.name.trim().slice(0, 2) };
    updateMedia((st) => ({ ...st, sponsorships: { ...st.sponsorships, [event.id]: [...(st.sponsorships[event.id] ?? []), s] } }));
    onOpenChange(false);
    form.reset();
    toast.success("স্পনসরের প্রস্তাব গেছে", { description: "আয়োজক নিশ্চিত করলে আপনার লোগো ইভেন্টের টি-শার্ট ও পোস্টে থাকবে।" });
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl bg-white font-sans sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">স্পনসর করুন</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">টাকা বা জিনিস — চারা, গ্লাভস, লোগোসহ টি-শার্ট। বিনিময়ে ইভেন্টের সব পোস্টে আপনার প্রতিষ্ঠানের নাম।</DialogDescription>
        </DialogHeader>
        {event.needs.length > 0 && (
          <p className="flex flex-wrap gap-1.5 text-xs">
            <span className="font-semibold text-text-secondary">দরকার:</span>
            {event.needs.map((n) => <span key={n} className="rounded-full bg-slate-100 px-2 py-0.5 text-text-secondary">{n}</span>)}
          </p>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>প্রতিষ্ঠানের নাম</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="offer" render={({ field }) => (
              <FormItem>
                <FormLabel>কী দেবেন</FormLabel>
                <FormControl><Input placeholder="লোগোসহ ৫০টি টি-শার্ট" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
              <HandHeart aria-hidden /> প্রস্তাব পাঠান
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EventCard({ event }: { event: CommunityEvent }) {
  const joined = useMediaState((s) => Boolean(s.joinedEvents[event.id]));
  const extra = useMediaState((s) => s.sponsorships[event.id] ?? EMPTY);
  const [sponsoring, setSponsoring] = useState(false);
  const organizer = getPerson(event.organizer) ?? currentUser;
  const own = event.organizer === currentUser.handle;
  const count = event.joined + (joined ? 1 : 0);
  const sponsors = [...event.sponsors, ...extra];
  const pct = Math.min(100, Math.round((count / event.goal) * 100));

  return (
    <article className="overflow-hidden rounded-2xl border border-card-border bg-white transition-shadow duration-200 hover:shadow-[0_6px_20px_-12px_rgb(15_23_42/0.18)]">
      <div className="relative aspect-16/7 bg-bd-green-light">
        {event.cover ? (
          <Image src={event.cover} alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        ) : (
          <span className="media-slot-pattern absolute inset-0" aria-hidden />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-bd-green-dark shadow-sm">{eventKindBn[event.kind]}</span>
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <h3 className="text-base font-bold text-text-primary">{event.title}</h3>
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden /><DateText iso={event.date} weekday time /></span>
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{event.area}, {event.district}</span>
        </p>
        <p className="text-sm leading-relaxed text-text-primary">{event.description}</p>

        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-semibold text-text-primary"><Num value={count} /> জন যোগ দিয়েছেন</span>
            <span className="text-text-muted">লক্ষ্য <Num value={event.goal} /></span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={event.goal} aria-label="স্বেচ্ছাসেবক">
            <div className="h-full rounded-full bg-bd-green transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {event.needs.length > 0 && (
          <p className="flex flex-wrap items-center gap-1.5 text-xs">
            <PackageOpen className="size-3.5 text-text-muted" aria-hidden />
            {event.needs.map((n) => <span key={n} className="rounded-full bg-slate-100 px-2 py-0.5 text-text-secondary">{n}</span>)}
          </p>
        )}

        {sponsors.length > 0 && (
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold text-text-secondary">স্পনসর</p>
            <ul className="space-y-1.5">
              {sponsors.map((s, i) => (
                <li key={`${s.name}-${i}`} className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[11px] font-bold text-bd-green ring-1 ring-card-border">{s.initials}</span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-sm font-semibold text-text-primary">{s.name}</span>
                    <span className="block text-xs text-text-muted">{s.offer}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-3">
          <Link href={`/media/u/${organizer.handle}`} className="flex items-center gap-2 text-xs text-text-secondary hover:text-bd-green">
            <PersonAvatar person={organizer} size="xs" /> আয়োজক: <span className="font-semibold">{organizer.nameBn}</span>
          </Link>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSponsoring(true)} className={mediaButton({ variant: "quiet", size: "sm" })}>
              <HandHeart aria-hidden /> স্পনসর
            </button>
            {own ? (
              <span className="inline-flex min-h-9 items-center rounded-xl bg-slate-100 px-3 text-sm font-semibold text-text-secondary">আপনার উদ্যোগ</span>
            ) : (
              <button
                type="button"
                aria-pressed={joined}
                onClick={() => {
                  toggleKey("joinedEvents", event.id);
                  if (!joined) toast.success("যোগ দিয়েছেন", { description: "আগের দিন মনে করিয়ে দেওয়া হবে।" });
                }}
                className={mediaButton({ variant: joined ? "outline" : "green", size: "sm" })}
              >
                {joined ? <CircleCheck aria-hidden /> : <UserPlus aria-hidden />}
                {joined ? "যোগ দিয়েছেন" : "যোগ দিন"}
              </button>
            )}
          </div>
        </div>
      </div>
      <SponsorDialog event={event} open={sponsoring} onOpenChange={setSponsoring} />
    </article>
  );
}

const eventDefaults: EventInput = { kind: "cleanup", title: "", area: "", district: currentUser.district, date: "", goal: 20, description: "", needs: "" };

/** Lead something: anyone can start a social-work event. */
export function CreateEventButton() {
  const [open, setOpen] = useState(false);
  const form = useForm<EventInput>({ resolver: zodResolver(eventSchema), defaultValues: eventDefaults });
  function onSubmit(v: EventInput) {
    const e: CommunityEvent = {
      id: newId("e"),
      kind: v.kind,
      title: v.title,
      organizer: currentUser.handle,
      area: v.area,
      district: v.district,
      date: `${v.date}T08:00:00+06:00`,
      description: v.description,
      goal: v.goal,
      joined: 1,
      needs: v.needs.split(/[,،]/).map((n) => n.trim()).filter(Boolean),
      sponsors: [],
    };
    updateMedia((s) => ({ ...s, myEvents: [e, ...s.myEvents] }));
    setOpen(false);
    form.reset(eventDefaults);
    toast.success("উদ্যোগ চালু হলো", { description: "এলাকার মানুষ যোগ দিতে পারবেন, প্রতিষ্ঠান স্পনসর করতে পারবে।" });
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "primary" })}>
        <Plus aria-hidden /> উদ্যোগ শুরু করুন
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary">উদ্যোগ শুরু করুন</DialogTitle>
            <DialogDescription className="text-sm text-text-secondary">এই দেশ আমাদের, এলাকাও আমাদের — পরিষ্কার রাখার দায়িত্বও আমাদের। আপনি নেতৃত্ব দিন।</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
              <FormField control={form.control} name="kind" render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>ধরন</FormGroupLabel>
                  <FormGroup className="flex flex-wrap gap-2">
                    {(Object.keys(eventKindBn) as EventKind[]).map((k) => (
                      <label key={k} className={choiceClass(field.value === k)}>
                        <input type="radio" className="sr-only" name={field.name} checked={field.value === k} onChange={() => field.onChange(k)} />
                        {eventKindBn[k]}
                      </label>
                    ))}
                  </FormGroup>
                </FormItem>
              )} />
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>নাম</FormLabel>
                  <FormControl><Input placeholder="যেমন: চলো, ১০০টা গাছ লাগাই" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem>
                    <FormLabel>এলাকা</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="district" render={({ field }) => (
                  <FormItem>
                    <FormLabel>জেলা</FormLabel>
                    <FormControl>
                      <select {...field} className={selectClass}>{districts.map((d) => <option key={d}>{d}</option>)}</select>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>তারিখ</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="goal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>কতজন লাগবে</FormLabel>
                    <FormControl><Input inputMode="numeric" value={field.value || ""} onChange={(e) => field.onChange(toNumber(e.target.value))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>কী করা হবে</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="needs" render={({ field }) => (
                <FormItem>
                  <FormLabel>কী কী লাগবে</FormLabel>
                  <FormControl><Input placeholder="গ্লাভস, ব্যাগ, চারা" {...field} /></FormControl>
                  <FormDescription>কমা দিয়ে আলাদা করুন — স্পনসরেরা এটা দেখে সাহায্য করবেন।</FormDescription>
                </FormItem>
              )} />
              <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
                <Megaphone aria-hidden /> চালু করুন
              </button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MyEvents() {
  const mine = useMediaState((s) => s.myEvents);
  if (mine.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-text-primary">আপনার শুরু করা উদ্যোগ</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {mine.map((e) => <EventCard key={e.id} event={e} />)}
      </div>
    </section>
  );
}
