"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { Form, FormControl, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { coursesBy } from "@/data/media/academy";
import { COMPLAINT_KINDS, type ComplaintKind } from "@/lib/media/academy";
import { complaintSchema, type ComplaintInput } from "@/lib/media/schemas";
import { newId, useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../ui/numerals";
import { primaryBtn, secondaryBtn } from "./catalogue/buttons";
import { choiceClass, fieldClass, labelClass, messageClass } from "./catalogue/fields";
import { Modal } from "./catalogue/modal";
import { updateAcademy, useAcademy } from "./use-academy";

/**
 * অভিযোগ বাক্স — a learner reports a teacher. The panel answers within 72
 * hours and the teacher never sees who wrote it; three upheld complaints
 * pause their teaching.
 */
export function ComplaintBox({ teacher, teacherName, course }: { teacher: string; teacherName: string; course?: string }) {
  const ensure = useRequireAccount();
  const hydrated = useHydrated();
  const complaints = useAcademy((a) => a.complaints);
  const [open, setOpen] = useState(false);
  const courses = coursesBy(teacher);
  const form = useForm<ComplaintInput>({ resolver: zodResolver(complaintSchema), defaultValues: { kind: undefined, course: course ?? courses[0]?.id ?? "", details: "" } });
  const kind = useWatch({ control: form.control, name: "kind" });
  const mine = hydrated ? complaints.filter((c) => c.teacher === teacher).length : 0;

  function onSubmit(v: ComplaintInput) {
    updateAcademy((a) => ({ ...a, complaints: [{ id: newId("cmp"), teacher, ...v, at: new Date().toISOString() }, ...a.complaints] }));
    setOpen(false);
    form.reset();
    toast.success("অভিযোগ জমা হয়েছে", { description: "৭২ ঘণ্টার মধ্যে প্যানেল দেখবে। শিক্ষক আপনার নাম দেখবেন না।" });
  }

  return (
    <>
      <button type="button" onClick={() => ensure("অভিযোগ জানাতে") && setOpen(true)} className={cn(secondaryBtn, "h-11 px-5")}>
        <ShieldAlert className="size-4" aria-hidden /> অভিযোগ বাক্স
      </button>
      {mine > 0 && (
        <p className="hud mt-3 text-(--c-faint)">
          আপনার <Num value={mine} />
          টি অভিযোগ প্যানেলে পর্যালোচনায়।
        </p>
      )}
      <Modal open={open} onClose={() => setOpen(false)} label={`${teacherName} — অভিযোগ`} className="max-h-[92dvh] overflow-y-auto">
        <div className="border-b border-(--c-line) px-6 py-5 pr-14">
          <p className="hud text-(--c-faint)">অভিযোগ বাক্স</p>
          <h2 className="display mt-2 text-xl text-(--c-ink-strong)">{teacherName}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-(--c-muted)">শিক্ষক আপনার নাম দেখবেন না। প্যানেল ৭২ ঘণ্টার মধ্যে দেখে দুই পক্ষের কথা শোনে।</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6 px-6 py-6">
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormGroupLabel className={labelClass}>কী হয়েছে</FormGroupLabel>
                  <FormGroup className="flex flex-wrap gap-2">
                    {(Object.keys(COMPLAINT_KINDS) as ComplaintKind[]).map((k) => (
                      <label key={k} className={choiceClass(field.value === k)}>
                        <input type="radio" className="sr-only" name={field.name} checked={field.value === k} onChange={() => field.onChange(k)} />
                        {COMPLAINT_KINDS[k]}
                      </label>
                    ))}
                  </FormGroup>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />
            {kind === "safety" && (
              <div role="alert" className="border-l-4 border-(--c-bad) bg-(--c-bg-sunken) p-4 text-sm leading-relaxed text-(--c-ink)">
                <p className="flex items-center gap-2 font-bold text-(--c-bad)">
                  <Phone className="size-4" aria-hidden /> এখনই বিপদে থাকলে ৯৯৯-এ ফোন করুন।
                </p>
                <p className="mt-1">নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন ১০৯ — বিনামূল্যে, ২৪ ঘণ্টা। হয়রানির অভিযোগ প্যানেল সবার আগে দেখে।</p>
              </div>
            )}
            {courses.length > 0 && (
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>কোন কোর্সে</FormLabel>
                    <FormControl>
                      <select {...field} className={fieldClass}>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.id} · {c.title}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>কী হয়েছিল, কবে</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="তারিখ, ক্লাস আর যা ঘটেছে — যত নির্দিষ্ট, তত দ্রুত সমাধান।" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />
            <button type="submit" className={cn(primaryBtn, "w-full")}>
              অভিযোগ জমা দিন
            </button>
          </form>
        </Form>
      </Modal>
    </>
  );
}
