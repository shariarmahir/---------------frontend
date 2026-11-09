"use client";

import { useState } from "react";
import { CalendarCheck, MailCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { jobs } from "@/data/media/jobs";
import { CURRENT_USER_HANDLE } from "@/data/media/users";
import { inviteIssues, nextSlot, type Invite } from "@/lib/media/hiring";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";

type Target = Pick<Invite, "to" | "toName" | "kind">;

/** The recruiter's side: which role, when to talk, and why this person. The roles they already posted are offered first. */
function InviteDialog({ target, role: suggested = "", open, onOpenChange }: { target: Target; role?: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const mine = useMediaState((s) => s.myJobs);
  const roles = [...mine, ...jobs.filter((j) => j.poster === CURRENT_USER_HANDLE)].map((j) => j.title);
  const [role, setRole] = useState(suggested);
  const [slot, setSlot] = useState(() => nextSlot(new Date()));
  const [note, setNote] = useState("");
  const [issues, setIssues] = useState<string[]>([]);

  function send() {
    const invite: Invite = { id: newId("inv"), ...target, role: role.trim(), note: note.trim(), slot: new Date(slot).toISOString(), at: new Date().toISOString() };
    const problems = inviteIssues(invite, new Date());
    setIssues(problems);
    if (problems.length > 0) return;
    updateMedia((s) => ({ ...s, invites: [invite, ...s.invites] }));
    onOpenChange(false);
    toast.success("আমন্ত্রণ পাঠানো হয়েছে", { description: `${target.toName} ইন্টারভিউয়ের সময় আর আপনার নোট দেখবেন।` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1rem)] overflow-y-auto rounded-2xl bg-m-card font-sans sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-m-ink">ইন্টারভিউয়ে আমন্ত্রণ — {target.toName}</DialogTitle>
          <DialogDescription className="text-sm text-m-ink/75">আমন্ত্রণে পদ, সময় আর কেন ডাকছেন লিখুন। তিনি রাজি হলে বার্তায় কথা এগোবে।</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-m-ink">পদ</span>
            <Input value={role} onChange={(e) => setRole(e.target.value)} list="invite-roles" name="role" autoComplete="off" placeholder="যেমন: জুনিয়র ফ্রন্টএন্ড ডেভেলপার…" />
            <datalist id="invite-roles">
              {roles.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-m-ink">ইন্টারভিউয়ের সময়</span>
            <Input type="datetime-local" value={slot} onChange={(e) => setSlot(e.target.value)} name="slot" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-m-ink">নোট</span>
            <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} name="note" placeholder="তাঁর কোন কাজ দেখে ডাকছেন, কাজটা কেমন…" />
          </label>
          {issues.length > 0 && (
            <ul role="alert" className="space-y-1 text-xs font-semibold text-m-red">
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
          <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>
            <Send aria-hidden /> আমন্ত্রণ পাঠান
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** "আমন্ত্রণ" on a card; once sent, it says so and shows when. */
export function InviteButton({ target, role, className }: { target: Target; role?: string; className?: string }) {
  const ensure = useRequireAccount();
  const [open, setOpen] = useState(false);
  const sent = useMediaState((s) => s.invites.find((i) => i.to === target.to));
  if (target.to === CURRENT_USER_HANDLE) return null;
  if (sent)
    return (
      <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-m-ink/8 px-3 text-sm font-semibold text-m-ink">
        <MailCheck className="size-4 text-m-green" aria-hidden /> আমন্ত্রিত
      </span>
    );
  return (
    <>
      <button type="button" onClick={() => ensure("আমন্ত্রণ পাঠাতে") && setOpen(true)} className={mediaButton({ variant: "primary", size: "sm", className })}>
        <CalendarCheck aria-hidden /> আমন্ত্রণ
      </button>
      {open && <InviteDialog target={target} role={role} open={open} onOpenChange={setOpen} />}
    </>
  );
}
