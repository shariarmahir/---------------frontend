"use client";

import { useMemo } from "react";
import { classVideos } from "@/data/media/academy";
import type { ClassVideo } from "@/lib/media/academy";
import { useAcademy } from "../use-academy";

const SHELF = [...classVideos].sort((a, b) => b.at.localeCompare(a.at));

/** Every class video, newest first: the ones put up on this device, then the shelf. */
export function useVideos(): ClassVideo[] {
  const mine = useAcademy((a) => a.videos);
  return useMemo(() => [...mine, ...SHELF], [mine]);
}
