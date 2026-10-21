"use client";

import { PageHead } from "@/components/hq/kit";
import { useHq } from "@/components/hq/provider";

/** Placeholder: the control agent builds the command centre here. */
export default function HqHomePage() {
  const me = useHq((v) => v.me.person);
  return <PageHead title="Command Center" lead={`Welcome, ${me.name}.`} />;
}
