"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Lock, MapPin, Plus, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { districts } from "@/data/media/districts";
import { teamKindBn, teamKindHint } from "@/data/media/teams";
import type { Team, TeamKind } from "@/data/media/types";
import { currentUser, getPerson } from "@/data/media/users";
import { teamSchema, type TeamInput } from "@/lib/media/schemas";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass } from "../ui/field-styles";
import { Num } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";

export function TeamCard({ team }: { team: Team }) {
  const status = useMediaState((s) => s.teamStatus[team.id]);
  const lead = getPerson(team.lead) ?? currentUser;
  const mine = team.lead === currentUser.handle || team.members.includes(currentUser.handle) || status === "member";
  const known = team.members.map((h) => getPerson(h)).filter((p) => p !== undefined);

  function request() {
    updateMedia((s) => ({ ...s, teamStatus: { ...s.teamStatus, [team.id]: "requested" } }));
    toast.success("যোগদানের অনুরোধ গেছে", { description: `${lead.nameBn} আপনার প্রোফাইল দেখে জানাবেন।` });
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-card-border bg-white transition-shadow duration-200 hover:shadow-[0_6px_20px_-12px_rgb(15_23_42/0.18)]">
      <div className="relative aspect-16/7 bg-bd-green-light">
        {team.cover ? <Image src={team.cover} alt="" fill sizes="(min-width: 1024px) 400px, 100vw" className="object-cover" /> : <span className="media-slot-pattern absolute inset-0" aria-hidden />}
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-bd-green-dark shadow-sm">{teamKindBn[team.kind]}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-bold text-text-primary">{team.name}</h3>
          <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden /><Num value={team.memberCount + (status === "member" ? 1 : 0)} /> জন</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{team.district}</span>
          </p>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{team.about}</p>
        <p className="flex flex-wrap gap-x-2 text-xs font-medium text-bd-green">{team.tags.map((t) => <span key={t}>{t}</span>)}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-card-border pt-3">
          <span className="flex -space-x-2">
            {known.map((p) => (
              <Link key={p.handle} href={`/media/u/${p.handle}`} className="rounded-full ring-2 ring-white" title={p.nameBn}>
                <PersonAvatar person={p} size="sm" />
              </Link>
            ))}
          </span>
          {mine ? (
            <span className="inline-flex min-h-9 items-center rounded-xl bg-bd-green-light px-3 text-sm font-semibold text-bd-green-dark">আপনার টিম</span>
          ) : status === "requested" ? (
            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-text-secondary"><Clock className="size-4" aria-hidden />অনুরোধ গেছে</span>
          ) : team.open ? (
            <button type="button" onClick={request} className={mediaButton({ variant: "green", size: "sm" })}>
              <UserPlus aria-hidden /> যোগ দিতে চাই
            </button>
          ) : (
            <span className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-text-muted"><Lock className="size-3.5" aria-hidden />নতুন সদস্য নিচ্ছে না</span>
          )}
        </div>
      </div>
    </article>
  );
}

const defaults: TeamInput = { kind: "project", name: "", district: currentUser.district, about: "", tags: "" };

export function CreateTeamButton() {
  const [open, setOpen] = useState(false);
  const form = useForm<TeamInput>({ resolver: zodResolver(teamSchema), defaultValues: defaults });
  function onSubmit(v: TeamInput) {
    const team: Team = {
      id: newId("tm"),
      kind: v.kind,
      name: v.name,
      lead: currentUser.handle,
      members: [currentUser.handle],
      memberCount: 1,
      district: v.district,
      about: v.about,
      tags: v.tags.split(/[\s,]+/).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`)),
      open: true,
    };
    updateMedia((s) => ({ ...s, myTeams: [team, ...s.myTeams], teamStatus: { ...s.teamStatus, [team.id]: "member" } }));
    setOpen(false);
    form.reset(defaults);
    toast.success("টিম তৈরি হলো", { description: "এখন সদস্যদের আমন্ত্রণ জানান বা চ্যালেঞ্জ নিন।" });
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "primary" })}>
        <Plus aria-hidden /> টিম বানান
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-primary">টিম বানান</DialogTitle>
            <DialogDescription className="text-sm text-text-secondary">পরিবার, ল্যাব, প্রজেক্ট, ভ্রমণ বা খেলা — একসাথে কাজ করলে বেশি হয়।</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
              <FormField control={form.control} name="kind" render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>ধরন</FormGroupLabel>
                  <FormGroup className="flex flex-wrap gap-2">
                    {(Object.keys(teamKindBn) as TeamKind[]).map((k) => (
                      <label key={k} className={choiceClass(field.value === k)}>
                        <input type="radio" className="sr-only" name={field.name} checked={field.value === k} onChange={() => field.onChange(k)} />
                        {teamKindBn[k]}
                      </label>
                    ))}
                  </FormGroup>
                  <FormDescription>{teamKindHint[field.value]}</FormDescription>
                </FormItem>
              )} />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>টিমের নাম</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="district" render={({ field }) => (
                  <FormItem>
                    <FormLabel>জেলা</FormLabel>
                    <FormControl><select {...field} className={selectClass}>{districts.map((d) => <option key={d}>{d}</option>)}</select></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="about" render={({ field }) => (
                <FormItem>
                  <FormLabel>টিম কী করে</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tags" render={({ field }) => (
                <FormItem>
                  <FormLabel>হ্যাশট্যাগ</FormLabel>
                  <FormControl><Input placeholder="#আইওটি #গবেষণা" {...field} /></FormControl>
                </FormItem>
              )} />
              <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
                <Users aria-hidden /> তৈরি করুন
              </button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MyTeams() {
  const mine = useMediaState((s) => s.myTeams);
  if (mine.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-text-primary">আপনার বানানো টিম</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{mine.map((t) => <TeamCard key={t.id} team={t} />)}</div>
    </section>
  );
}
