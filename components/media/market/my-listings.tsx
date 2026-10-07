"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BOOST_TIERS } from "@/data/media/bazaar";
import type { Listing } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { updateMedia, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { Num, Taka } from "../ui/numerals";
import { ListingCard } from "./listing-card";

function BoostButton({ listing }: { listing: Listing }) {
  const [open, setOpen] = useState(false);
  if (listing.featured) return <p className="text-center text-xs font-semibold text-m-blue">ম্যাচ বুস্ট চালু</p>;
  function boost(days: number) {
    const ok = updateMedia((s) => ({ ...s, listings: s.listings.map((l) => (l.id === listing.id ? { ...l, featured: true } : l)) }));
    setOpen(false);
    if (ok) toast.success(`${days} দিনের বুস্ট চালু`, { description: "ডেমো: কোনো টাকা কাটা হয়নি।" });
    else toast.error("এই ব্রাউজারে সেভ করা গেল না");
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={mediaButton({ variant: "outline", size: "sm", className: "w-full" })}>
        <Megaphone aria-hidden /> ম্যাচ বুস্ট
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ম্যাচ বুস্ট</DialogTitle>
            <DialogDescription>যাঁরা এই হ্যাশট্যাগ বা বিভাগ খোঁজেন, শুধু তাঁদের তালিকায় আপনার পণ্য আগে আসবে।</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {BOOST_TIERS.map((t) => (
              <button key={t.taka} type="button" onClick={() => boost(t.days)} className="rounded-2xl bg-m-card px-3 py-4 text-center ring-1 ring-m-ink/10 transition-[translate,box-shadow] hover:-translate-y-0.5 hover:ring-m-blue active:scale-[0.97] motion-reduce:transition-none shadow-m-tile">
                <span className="block text-xl font-bold text-m-blue"><Taka amount={t.taka} /></span>
                <span className="text-xs text-m-ink/75"><Num value={t.days} /> দিন</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Listings the viewer created, shown first, each with its boost. */
export function MyListings() {
  const mine = useMediaState((s) => s.listings);
  if (mine.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-bold text-m-ink">আপনার বিক্রির তালিকা</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mine.map((l) => (
          <div key={l.id} className="flex flex-col gap-2">
            <ListingCard listing={l} seller={currentUser} />
            <BoostButton listing={l} />
          </div>
        ))}
      </div>
    </section>
  );
}
