"use client";

import { useMemo } from "react";
import { dhakaDay } from "@/lib/hq/rules";
import type { Person } from "@/lib/hq/types";
import { useHq, useNow } from "./provider";

/** Everyone by id (stable between polls unless people changed). */
export function usePeople(): Map<string, Person> {
  const people = useHq((v) => v.people);
  return useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
}

/** A name for an id, even for ids that aren't people (e.g. "system"). */
export function nameOf(people: Map<string, Person>, id: string | undefined): string {
  if (!id) return "—";
  return people.get(id)?.name ?? (id === "system" ? "Kandari HQ" : "Former member");
}

export function useMe(): Person {
  return useHq((v) => v.me.person);
}

/** Today's Dhaka day, refreshed every minute. */
export function useToday(): string {
  return dhakaDay(useNow(60_000));
}

/** People checked in today (and not checked out). */
export function useInOffice(): Set<string> {
  const checkins = useHq((v) => v.checkins);
  const day = useToday();
  return useMemo(() => new Set(checkins.filter((c) => c.day === day && !c.out).map((c) => c.personId)), [checkins, day]);
}
