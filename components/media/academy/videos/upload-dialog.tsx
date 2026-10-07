"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CLASS_MINUTES, type ClassVideo } from "@/lib/media/academy";
import { videoSchema, type VideoInput } from "@/lib/media/schemas";
import { newId } from "@/lib/media/store";
import { mediaButton } from "../../ui/button-styles";
import { choiceClass, selectClass, toNumber } from "../../ui/field-styles";
import { useFormat } from "../../ui/numerals";
import { useTeacher } from "../desk/use-teacher";
import { updateAcademy } from "../use-academy";

/**
 * Putting up a class video: which course and week, the YouTube or Drive
 * link (the file itself stays there), its length, and whether it is the
 * free class for everyone or a video for the course.
 */
export function UploadDialog({ open, onOpenChange, owes }: { open: boolean; onOpenChange: (open: boolean) => void; owes: boolean }) {
  const t = useTeacher();
  const { num } = useFormat();
  const form = useForm<VideoInput>({
    resolver: zodResolver(videoSchema),
    defaultValues: { course: t.live[0]?.id ?? "", title: "", week: 1, href: "", short: false, length: CLASS_MINUTES, access: "free", about: "" },
  });
  const [courseId, short] = useWatch({ control: form.control, name: ["course", "short"] });
  const course = t.live.find((c) => c.id === courseId);

  function onSubmit(v: VideoInput) {
    const video: ClassVideo = {
      id: newId("vid"),
      course: v.course,
      teacher: t.handle,
      title: v.title.trim(),
      week: v.week,
      seconds: v.short ? v.length : v.length * 60,
      access: v.access,
      short: v.short || undefined,
      at: new Date().toISOString(),
      views: 0,
      href: v.href.trim(),
      about: v.about.trim() || undefined,
    };
    if (!updateAcademy((a) => ({ ...a, videos: [video, ...a.videos] }))) {
      toast.error("ব্রাউজারের জায়গা ভরে গেছে", { description: "পুরোনো উপকরণ মুছে আবার চেষ্টা করুন।" });
      return;
    }
    toast.success(v.access === "free" && !v.short ? "এ সপ্তাহের বিনামূল্যের ক্লাস উঠল" : "ভিডিও উঠল", { description: v.title });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-text-primary font-sans sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">ক্লাস ভিডিও তুলুন</DialogTitle>
          <DialogDescription className="text-white/75">
            {owes ? "এ সপ্তাহের বিনামূল্যের ক্লাসটা এখনো বাকি — প্রতি সপ্তাহে একটা, সবার জন্য।" : "ভিডিওটা ইউটিউবে (আনলিস্টেড হলেও চলে) বা ড্রাইভে তুলে লিংক দিন।"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="course" render={({ field }) => (
                <FormItem>
                  <FormLabel>কোর্স</FormLabel>
                  <FormControl>
                    <select {...field} onChange={(e) => { field.onChange(e.target.value); form.setValue("week", 1); }} className={selectClass}>
                      {t.live.map((c) => <option key={c.id} value={c.id}>{c.id} · {c.title}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="week" render={({ field }) => (
                <FormItem>
                  <FormLabel>কোন সপ্তাহের ক্লাস</FormLabel>
                  <FormControl>
                    <select
                      value={field.value}
                      onChange={(e) => {
                        const week = Number(e.target.value);
                        field.onChange(week);
                        // An empty title takes the lesson's name.
                        if (!form.getValues("title").trim() && course) form.setValue("title", course.lessons[week - 1]?.title ?? "", { shouldValidate: true });
                      }}
                      className={selectClass}
                    >
                      {course?.lessons.map((l, i) => <option key={l.title} value={i + 1}>সপ্তাহ {num(i + 1)} — {l.title}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>ভিডিওর নাম</FormLabel>
                <FormControl><Input placeholder="যেমন: ব্রেডবোর্ডে প্রথম সার্কিট" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="href" render={({ field }) => (
              <FormItem>
                <FormLabel>ভিডিওর লিংক</FormLabel>
                <FormControl><Input type="url" inputMode="url" placeholder="https://youtu.be/…" {...field} /></FormControl>
                <FormDescription>ইউটিউবের লিংক হলে এখানেই চলবে; ড্রাইভের লিংক নতুন ট্যাবে খুলবে।</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="short" render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>ধরন</FormGroupLabel>
                  <FormGroup className="flex flex-wrap gap-2">
                    {[false, true].map((s) => (
                      <label key={String(s)} className={choiceClass(field.value === s)}>
                        <input type="radio" className="sr-only" name={field.name} checked={field.value === s} onChange={() => { field.onChange(s); form.setValue("length", s ? 0 : CLASS_MINUTES); if (s) form.setValue("access", "free"); }} />
                        {s ? "ছোট (১ মিনিটের কম)" : `পুরো ক্লাস (${num(CLASS_MINUTES)} মিনিট)`}
                      </label>
                    ))}
                  </FormGroup>
                </FormItem>
              )} />
              <FormField control={form.control} name="length" render={({ field }) => (
                <FormItem>
                  <FormLabel>দৈর্ঘ্য ({short ? "সেকেন্ড" : "মিনিট"})</FormLabel>
                  <FormControl><Input inputMode="numeric" className="tabular-nums" value={field.value || ""} placeholder="০" onChange={(e) => field.onChange(toNumber(e.target.value))} /></FormControl>
                  {!short && <FormDescription>প্রতিটা অনলাইন ক্লাস ঠিক {num(CLASS_MINUTES)} মিনিটের।</FormDescription>}
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="access" render={({ field }) => (
              <FormItem>
                <FormGroupLabel>কারা দেখবে</FormGroupLabel>
                <FormGroup className="flex flex-wrap gap-2">
                  {(["free", "paid"] as const).map((a) => (
                    <label key={a} className={choiceClass(field.value === a)}>
                      <input type="radio" className="sr-only" name={field.name} checked={field.value === a} disabled={short && a === "paid"} onChange={() => field.onChange(a)} />
                      {a === "free" ? "সবাই — বিনামূল্যে" : "শুধু কোর্সে ভর্তিরা"}
                    </label>
                  ))}
                </FormGroup>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="about" render={({ field }) => (
              <FormItem>
                <FormLabel>বর্ণনা (ইচ্ছে হলে)</FormLabel>
                <FormControl><Textarea rows={3} placeholder="এই ক্লাসে কী শিখবেন, বাড়ির কাজ কী" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <button type="submit" className={mediaButton({ size: "lg", className: "w-full" })}>
              <Upload aria-hidden /> ভিডিও তুলুন
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
