/** Static content for the sovereign identity & resume verification portal. */

export interface SignupStep {
  n: string;
  status: string;
  label: string;
  state: "done" | "active" | "upcoming";
}

export const signupSteps: SignupStep[] = [
  { n: "১", status: "ধাপ ০১ : সম্পন্ন", label: "বেসিক ও স্বাস্থ্য তথ্য", state: "done" },
  { n: "২", status: "ধাপ ০২ : চলমান", label: "NID / পাসপোর্ট যাচাই", state: "active" },
  { n: "৩", status: "ধাপ ০৩", label: "পেশা ও রিজিউমে ফিল্ড", state: "upcoming" },
  { n: "৪", status: "ধাপ ০৪", label: "লাইভ বায়োমেট্রিক", state: "upcoming" },
  { n: "৫", status: "ধাপ ০৫", label: "জেলা নোড ও ইস্যুয়েন্স", state: "upcoming" },
];

export const bloodGroups = [
  "A+ (A Positive)",
  "A- (A Negative)",
  "B+ (B Positive)",
  "B- (B Negative)",
  "O+ (O Positive)",
  "O- (O Negative)",
  "AB+ (AB Positive)",
  "AB- (AB Negative)",
];

export interface DocType {
  id: string;
  title: string;
  note: string;
}

export const docTypes: DocType[] = [
  { id: "nid", title: "জাতীয় স্মার্ট NID", note: "১০/১৭ সংখ্যার বায়োমেট্রিক কার্ড" },
  {
    id: "passport",
    title: "আন্তর্জাতিক পাসপোর্ট",
    note: "ই-পাসপোর্ট / মেশিন রিডেবল",
  },
  {
    id: "birth",
    title: "ডিজিটাল জন্ম নিবন্ধন সনদ",
    note: "১৬/১৭ ডিজিট (১৮-এর কম)",
  },
];

export interface CareerRole {
  id: string;
  icon: string;
  title: string;
  note: string;
}

export const careerRoles: CareerRole[] = [
  {
    id: "student",
    icon: "school",
    title: "শিক্ষার্থী (Student)",
    note: "বিশ্ববিদ্যালয়/কলেজ শিক্ষার্থী (ইঞ্জিনিয়ারিং, মেডিকেল, সাধারণ বিজ্ঞান)",
  },
  {
    id: "doctor",
    icon: "stethoscope",
    title: "চিকিৎসক (Doctor / BMDC)",
    note: "BMDC রেজিস্টার্ড চিকিৎসক, বায়োমেডিক্যাল ও টেলিমেডিসিন বিশেষজ্ঞ",
  },
  {
    id: "engineer",
    icon: "memory",
    title: "প্রকৌশলী / উদ্ভাবক (Engineer)",
    note: "সেমিকন্ডাক্টর, ভিএলএসআই, বায়োমেডিক্যাল, সফটওয়্যার ও আইওটি",
  },
  {
    id: "pharmacy",
    icon: "local_pharmacy",
    title: "ফার্মেসি উদ্যোক্তা (Pharmacy Partner)",
    note: "DGDA লাইসেন্সপ্রাপ্ত এক গ্রাম-এক হেলথকেয়ার সেন্টার পার্টনার",
  },
  {
    id: "civic",
    icon: "public",
    title: "নাগরিক গবেষক (Civic Researcher)",
    note: "কৃষি, জলবায়ু, রোবটিক্স ও সামাজিক প্রযুক্তির গ্রাউন্ড গবেষক",
  },
  {
    id: "other",
    icon: "work",
    title: "অন্যান্য পেশাজীবী (Others / Corporate)",
    note: "ফ্রিল্যান্সার, আইটি কনসালট্যান্ট, ডিজাইনার ও কর্পোরেট কর্মী",
  },
];

export const engineeringDomains = [
  "Semiconductor, RISC-V & VLSI Design",
  "Embedded IoT & Telemetry Hardware",
  "Clinical Biomedical Instrumentation",
  "Full-Stack Software Architecture",
  "AI / Machine Learning Edge Computing",
  "Autonomous Robotics & AgTech Mechatronics",
];

export const divisions = [
  "ঢাকা (Dhaka)",
  "চট্টগ্রাম (Chattogram)",
  "সিলেট (Sylhet)",
  "রাজশাহী (Rajshahi)",
  "খুলনা (Khulna)",
  "বরিশাল (Barishal)",
  "রংপুর (Rangpur)",
  "ময়মনসিংহ (Mymensingh)",
];

export const districts = [
  "মৌলভীবাজার (Maulvibazar)",
  "সিলেট (Sylhet)",
  "হবিগঞ্জ (Habiganj)",
  "সুনামগঞ্জ (Sunamganj)",
  "ঢাকা (Dhaka)",
  "রংপুর (Rangpur)",
  "চট্টগ্রাম (Chattogram)",
];

export const livenessChecks = [
  "পর্যাপ্ত আলো ও ক্লিন ব্যাকগ্রাউন্ড শনাক্ত",
  "কোন সানগ্লাস বা মাস্ক পরিহিত নেই",
  "ডিপফেক বা প্রিন্টেড পেপার স্পুফ প্রতিরোধ সুরক্ষিত",
];

export const complianceBadges = [
  {
    icon: "verified_user",
    label: "বাংলাদেশ নির্বাচন কমিশন ও পাসপোর্ট এপিআই",
    status: "সক্রিয়",
  },
  { icon: "health_and_safety", label: "DGHS ক্লিনিক্যাল প্রোটোকল", status: "অনুমোদিত" },
  { icon: "encrypted", label: "ISO/IEC 27001 & PQC Level-5", status: "এনক্রিপ্টেড" },
];

export const trustReasons = [
  {
    title: "স্বাস্থ্য সুরক্ষায় নিশ্চয়তা:",
    body: "স্বস্তি (SWASTI) টেলিমেডিসিন নেটওয়ার্কে অননুমোদিত বা ভুয়া প্রেসক্রিপশন প্রদান শতভাগ রোধ করা হয়।",
  },
  {
    title: "ডিপ-টেক ক্লিনরুম এক্সেস:",
    body: "সেমিকন্ডাক্টর RISC-V ও বায়ো-ইনফরমেটিক্স সার্ভার অবকাঠামো ব্যবহারের অনুমতি সুরক্ষিত রাখা।",
  },
  {
    title: "সার্বভৌম উপাত্ত নিরাপত্তা:",
    body: "কোনো সংবেদনশীল স্বাস্থ্য, উদ্ভাবন ও রিজিউমে তথ্য দেশের সীমানার বাইরে পাচার না হওয়ার আইনি ভিত্তি।",
  },
];

export const resumeSkills = ["RISC-V", "Embedded C", "Bio-Sensors", "Edge-AI"];

export const consentLines = [
  "আমি সজ্ঞানে ঘোষণা করছি যে উপরে প্রদত্ত জাতীয় পরিচয়পত্র/পাসপোর্ট, পেশাগত বিবরণী, সোশ্যাল লিংক এবং বায়োমেট্রিক উপাত্ত সম্পূর্ণ সত্য ও আমার নিজস্ব। কোনো তথ্য বিভ্রান্তিকর প্রমাণিত হলে জাতীয় সাইবার নিরাপত্তা আইন অনুযায়ী দায়ভার গ্রহণ করব।",
  "আমি কাণ্ডারী-ল্যাবের সার্বভৌম ডিজিটাল নীতিমালা এবং ‘জিরো ফরেন ক্লাউড লিকেজ’ প্রাইভেসি চার্টার ও ওপেন ক্যারিয়ার রিজিউমে শর্তাবলী মেনে চলার অঙ্গীকার করছি।",
];
