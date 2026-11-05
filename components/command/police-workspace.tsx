"use client";

import { DeptWorkspace, DeptWorkspaceFallback } from "./dept-workspace";

/** /protibad/command/police: the police desk (see dept-workspace.tsx). Render it inside <Suspense>. */
export function PoliceWorkspace() {
  return <DeptWorkspace dept="police" />;
}

export function PoliceWorkspaceFallback() {
  return <DeptWorkspaceFallback dept="police" />;
}
