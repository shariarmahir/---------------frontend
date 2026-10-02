import type { Post, PostTopic } from "./types";

/**
 * What each kind of post is for, in the order the composer offers them.
 * A post can be about anything — life comes first; only the topics marked
 * `rated` carry a self-rating for the community to verify.
 */
export const topics: { id: PostTopic; bn: string; hint: string; rated: boolean }[] = [
  { id: "daily", bn: "জীবন", hint: "ব্যক্তিগত জীবন, ভাবনা, আজকের মুহূর্ত", rated: false },
  { id: "talent", bn: "প্রতিভা", hint: "গান, নাচ, আঁকা, কবিতা, অভিনয় — যা ভালোবেসে পারেন", rated: false },
  { id: "skill", bn: "দক্ষতা", hint: "কাজ দেখান, নিজেকে রেটিং দিন", rated: true },
  { id: "education", bn: "শিক্ষা", hint: "যা জানেন, শেখান", rated: true },
  { id: "research", bn: "গবেষণা", hint: "গবেষণা, প্রোটোটাইপ, থিসিস", rated: true },
  { id: "team", bn: "টিম প্রজেক্ট", hint: "কয়েকজন মিলে যা বানালেন", rated: true },
  { id: "help", bn: "সাহায্য", hint: "রক্ত, চিকিৎসা, জরুরি প্রয়োজন", rated: false },
  { id: "rights", bn: "নাগরিক অধিকার", hint: "অন্যায়ের প্রতিবাদ, ন্যায্য দাবি", rated: false },
  { id: "entertainment", bn: "বিনোদন", hint: "মজার মুহূর্ত, খেলা, গান", rated: false },
];

const byId = new Map(topics.map((t) => [t.id, t]));

export function topicOf(post: Pick<Post, "topic">) {
  return byId.get(post.topic ?? "skill")!;
}

export function isTopic(value: string): value is PostTopic {
  return byId.has(value as PostTopic);
}

/** A post with a claim for the community to verify. */
export type RatedPost = Post & { skill: NonNullable<Post["skill"]> };

export function isRated(post: Post): post is RatedPost {
  return Boolean(post.skill);
}
