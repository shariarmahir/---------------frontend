"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SealCheck, SealWarning } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormGroup, FormGroupLabel, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { Post } from "@/data/media/types";
import { CURRENT_USER_HANDLE } from "@/data/media/users";
import { verifySchema, type VerifyInput } from "@/lib/media/schemas";
import { newId, updateMedia } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Num } from "../ui/numerals";
import { StarInput } from "../ui/star-input";

/**
 * "Verify this rating": the viewer looks at the proof and gives their own
 * stars. Agreeing is a verification; rating it clearly lower is a
 * challenge and needs a reason, which is posted to the discussion.
 */
export function VerifyDialog({
  open,
  onOpenChange,
  postId,
  authorName,
  skill,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  postId: string;
  authorName: string;
  skill: Post["skill"];
}) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<VerifyInput>({
    resolver: zodResolver(verifySchema),
    defaultValues: { stars: 0, verdict: "verify", reason: "" },
  });
  const verdict = useWatch({ control: form.control, name: "verdict" });

  function onSubmit(v: VerifyInput) {
    setSubmitting(true);
    const at = new Date().toISOString();
    updateMedia((s) => ({
      ...s,
      ratings: { ...s.ratings, [postId]: { stars: v.stars, verdict: v.verdict, reason: v.reason, at } },
      comments: v.reason
        ? {
            ...s.comments,
            [postId]: [
              ...(s.comments[postId] ?? []),
              { id: newId("c"), author: CURRENT_USER_HANDLE, text: v.reason, at, likes: 0, verdict: { kind: v.verdict, stars: v.stars } },
            ],
          }
        : s.comments,
    }));
    setSubmitting(false);
    onOpenChange(false);
    toast.success(v.verdict === "verify" ? "যাচাই যোগ হয়েছে" : "চ্যালেঞ্জ জমা হয়েছে", {
      description: v.verdict === "verify" ? "আপনার রেটিং কমিউনিটির গড়ে যুক্ত হলো।" : "কারণটি আলোচনায় দেখা যাবে।",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white font-sans sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">রেটিং যাচাই করুন</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-text-secondary">
            {authorName} নিজেকে “{skill.name}”-এ <span className="font-bold text-orange-800"><Num value={skill.self} />★</span> দিয়েছেন। প্রমাণ দেখে আপনি কত দেবেন?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
            <FormField
              control={form.control}
              name="stars"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormGroupLabel>আপনার রেটিং</FormGroupLabel>
                  <div>
                      <StarInput
                        label="আপনার রেটিং"
                        value={field.value}
                        invalid={!!fieldState.error}
                        onChange={(n) => {
                          field.onChange(n);
                          // Suggest a challenge when the viewer lands well below the claim.
                          form.setValue("verdict", skill.self - n >= 1.5 ? "challenge" : "verify");
                        }}
                      />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="verdict"
              render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>আপনার মত</FormGroupLabel>
                  <FormGroup className="grid grid-cols-2 gap-2">
                    {([
                      ["verify", "দাবি ঠিক আছে", SealCheck, "border-bd-green bg-bd-green-light text-bd-green-dark"],
                      ["challenge", "দাবি বেশি", SealWarning, "border-red-300 bg-red-50 text-national-crimson"],
                    ] as const).map(([value, label, Icon, on]) => (
                      <label
                        key={value}
                        className={cn(
                          "flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-bd-green/30",
                          field.value === value ? on : "border-card-border text-text-secondary hover:border-slate-300",
                        )}
                      >
                        <input type="radio" className="sr-only" name={field.name} checked={field.value === value} onChange={() => field.onChange(value)} />
                        <Icon size={22} weight="duotone" aria-hidden />
                        {label}
                      </label>
                    ))}
                  </FormGroup>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{verdict === "challenge" ? "কেন বেশি মনে হলো? (আবশ্যক)" : "মন্তব্য (ঐচ্ছিক)"}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={verdict === "challenge" ? "কী দেখে মনে হলো দাবিটা বেশি — নির্দিষ্ট করে লিখুন, যেন উনি শিখতে পারেন।" : "কোন জিনিসটা ভালো লাগল?"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button type="submit" disabled={submitting} className={mediaButton({ variant: verdict === "challenge" ? "danger" : "green", size: "lg", className: "w-full" })}>
              {verdict === "challenge" ? <SealWarning size={20} weight="duotone" aria-hidden /> : <SealCheck size={20} weight="duotone" aria-hidden />}
              {verdict === "challenge" ? "চ্যালেঞ্জ জমা দিন" : "যাচাই জমা দিন"}
            </button>
            <p className="text-center text-xs text-text-muted">একটি পোস্টে একবারই রেটিং দেওয়া যায়। আপনার নাম আলোচনায় দেখাবে।</p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
