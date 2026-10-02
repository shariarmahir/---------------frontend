import type { FeelingId, PostBg } from "./types";

/** Feelings and activities a post can carry, in the order the composer offers them. */
export const feelings: { id: FeelingId; emoji: string; bn: string; line: string }[] = [
  { id: "happy", emoji: "😊", bn: "খুশি", line: "খুশি অনুভব করছেন" },
  { id: "grateful", emoji: "🙏", bn: "কৃতজ্ঞ", line: "কৃতজ্ঞ অনুভব করছেন" },
  { id: "proud", emoji: "🏅", bn: "গর্বিত", line: "গর্বিত অনুভব করছেন" },
  { id: "excited", emoji: "🤩", bn: "উচ্ছ্বসিত", line: "উচ্ছ্বসিত" },
  { id: "celebrating", emoji: "🎉", bn: "উদযাপন", line: "উদযাপন করছেন" },
  { id: "calm", emoji: "😌", bn: "শান্ত", line: "শান্ত অনুভব করছেন" },
  { id: "learning", emoji: "📚", bn: "শিখছি", line: "নতুন কিছু শিখছেন" },
  { id: "working", emoji: "🛠️", bn: "কাজ করছি", line: "কাজে ব্যস্ত" },
  { id: "thinking", emoji: "🤔", bn: "ভাবছি", line: "ভাবছেন" },
  { id: "sad", emoji: "😔", bn: "মন খারাপ", line: "মন খারাপ" },
];

export const feelingOf = (id?: FeelingId) => feelings.find((f) => f.id === id);

/** Solid colour fields for short text posts, with the ink that reads on each. */
export const postBgs: { id: PostBg; bn: string; className: string }[] = [
  { id: "gold", bn: "সোনালি", className: "bg-signal-orange text-text-primary" },
  { id: "green", bn: "সবুজ", className: "bg-bd-green text-white" },
  { id: "orange", bn: "কমলা", className: "bg-bdorange-600 text-text-primary" },
  { id: "white", bn: "সাদা", className: "bg-white text-text-primary" },
  { id: "ink", bn: "গাঢ়", className: "bg-black text-signal-orange ring-1 ring-white/15" },
];

export const bgOf = (id?: PostBg) => postBgs.find((b) => b.id === id);
