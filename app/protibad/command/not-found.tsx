import Link from "next/link";
import { EmptyState, cb } from "@/components/command/kit";
import { CommandPage } from "@/components/command/shell";

/**
 * An unknown station or business id, or any other address under /protibad/command
 * (the [...rest] catch-all hands those here): still inside the dashboard frame, with the way back.
 */
export default function CommandNotFound() {
  return (
    <CommandPage title="Not found" subtitle="There is no such page, station or business in this demo.">
      <EmptyState icon="search_off" title="This page is not on the board">
        Check the address, or go back to the overview and pick a workspace from the sidebar.
      </EmptyState>
      <div className="flex flex-wrap gap-2">
        <Link href="/protibad/command" className={cb.gold}>
          Back to overview
        </Link>
        <Link href="/protibad/command/police/stations" className={cb.outline}>
          Police stations
        </Link>
        <Link href="/protibad/command/consumer/businesses" className={cb.outline}>
          Businesses
        </Link>
      </div>
    </CommandPage>
  );
}
