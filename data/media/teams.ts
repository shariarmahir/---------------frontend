import type { Team, TeamKind } from "./types";

export const teamKindBn: Record<TeamKind, string> = {
  family: "প্রোডাক্টিভ ফ্যামিলি",
  lab: "ইউনিভার্সিটি ল্যাব",
  project: "প্রজেক্ট টিম",
  travel: "ভ্রমণ দল",
  sports: "খেলার দল",
};

export const teamKindHint: Record<TeamKind, string> = {
  family: "পরিবারের সবাই মিলে উৎপাদনশীল কাজ — তাঁত, রান্না, দোকান।",
  lab: "বিশ্ববিদ্যালয়ের ল্যাব ও গবেষণা দল — যোগ দিন, চ্যালেঞ্জ নিন।",
  project: "একটা সমস্যা সমাধানে কয়েকজন — কোড, নকশা, প্রোটোটাইপ।",
  travel: "একসাথে ঘোরা, খরচ ভাগ, ছবি শেয়ার।",
  sports: "খেলুন, শিখুন, শেখান।",
};

export const teams: Team[] = [
  {
    id: "tm-hasina-family",
    kind: "family",
    name: "রূপগঞ্জের তাঁতঘর",
    lead: "hasina",
    members: ["hasina"],
    memberCount: 4,
    district: "নারায়ণগঞ্জ",
    about: "স্বামী-স্ত্রী আর দুই ছেলে — একজন সুতা রাঙায়, দুজন বোনে, একজন অনলাইনে বিক্রি সামলায়। পরিবারই আমাদের কারখানা।",
    tags: ["#জামদানি", "#পরিবার"],
    open: false,
    cover: "/media/fashion-jamdani.webp",
  },
  {
    id: "tm-rahima-kitchen",
    kind: "family",
    name: "রহিমা খালার রান্নাঘর",
    lead: "rahima",
    members: ["rahima"],
    memberCount: 3,
    district: "ঢাকা",
    about: "মা রান্না করেন, মেয়ে অর্ডার নেয়, ছেলে ডেলিভারি দেয়। অফিসের টিফিন থেকে বিয়ের রান্না।",
    tags: ["#ঘরের_রান্না", "#টিফিন"],
    open: false,
    cover: "/media/kacchi.webp",
  },
  {
    id: "tm-iot-lab",
    kind: "lab",
    name: "বুয়েট আইওটি ও এমবেডেড ল্যাব",
    lead: "anik",
    members: ["anik", "mahir"],
    memberCount: 18,
    district: "ঢাকা",
    about: "বন্যা-সেন্সর, স্মার্ট সেচ, হাসপাতালের যন্ত্র — বাংলাদেশের সমস্যায় কম দামের হার্ডওয়্যার। অন্য বিশ্ববিদ্যালয়ের শিক্ষার্থীরাও যোগ দিতে পারেন।",
    tags: ["#আইওটি", "#গবেষণা", "#ওপেন_সোর্স"],
    open: true,
    cover: "/media/circuit.webp",
  },
  {
    id: "tm-bus-team",
    kind: "project",
    name: "লোকাল বাস কোথায়",
    lead: "anik",
    members: ["anik", "rupa"],
    memberCount: 4,
    district: "ঢাকা",
    about: "যাত্রীদের লাইভ লোকেশন দিয়ে ঢাকার লোকাল বাস খুঁজে পাওয়ার অ্যাপ। হ্যাকাথনে রানার-আপ, এখন দুজন ফ্রন্টএন্ড ডেভেলপার খুঁজছি।",
    tags: ["#টিম_প্রজেক্ট", "#পরিবহন"],
    open: true,
    cover: "/media/challenge-hackathon.webp",
  },
  {
    id: "tm-bandarban-trek",
    kind: "travel",
    name: "বান্দরবান ট্রেক — অক্টোবর",
    lead: "nabila",
    members: ["nabila", "sumaiya"],
    memberCount: 9,
    district: "বান্দরবান",
    about: "থানচি থেকে তিন দিনের ট্রেক। খরচ ভাগ, স্থানীয় গাইডকে ন্যায্য মজুরি, প্লাস্টিক ফেরত আনা বাধ্যতামূলক। ১২ জন হলে বন্ধ।",
    tags: ["#ভ্রমণ", "#ট্রেকিং"],
    open: true,
    cover: "/bangladesh/bandarban.jpg",
  },
  {
    id: "tm-u12-cricket",
    kind: "sports",
    name: "শাহ মখদুম অনূর্ধ্ব-১২",
    lead: "sabbir",
    members: ["sabbir"],
    memberCount: 22,
    district: "রাজশাহী",
    about: "প্রতি শুক্র-শনিবার সকালে নেট। অভিভাবকেরাও খেলা শেখাতে পারেন — যাঁরা একসময় খেলতেন।",
    tags: ["#ক্রিকেট", "#শিশু"],
    open: true,
    cover: "/media/team-cricket.webp",
  },
];

export function getTeam(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}
