"use client";

import { createContext, useContext } from "react";
import type { Child } from "@/lib/media/class-access";

/** Who opened the classroom: the account's own student, or a parent watching a child. */
export type ClassSession = { mode: "student" } | { mode: "parent"; child: Child };

export const SessionContext = createContext<ClassSession | null>(null);

/** Null outside the classroom's full-screen session. */
export const useClassSession = () => useContext(SessionContext);

export const useParentView = () => useClassSession()?.mode === "parent";
