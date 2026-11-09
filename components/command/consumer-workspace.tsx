"use client";

import { DeptWorkspace, DeptWorkspaceFallback } from "./dept-workspace";

/** /protibad/command/consumer: the ভোক্তা অধিদপ্তর desk (see dept-workspace.tsx). Render it inside <Suspense>. */
export function ConsumerWorkspace() {
  return <DeptWorkspace dept="consumer" />;
}

export function ConsumerWorkspaceFallback() {
  return <DeptWorkspaceFallback dept="consumer" />;
}
