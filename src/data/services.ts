export interface Service {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export const services: Service[] = [
  {
    slug: "skills-training",
    title: "Skills Training",
    description:
      "Structured, job-ready training programs designed with industry partners.",
    icon: "GraduationCap",
  },
  {
    slug: "job-matching",
    title: "Job Matching",
    description:
      "Connecting trained talent directly with hiring partners across Bangladesh.",
    icon: "Handshake",
  },
  {
    slug: "mentorship",
    title: "Mentorship",
    description:
      "Ongoing guidance from experienced professionals in every Kandari's field.",
    icon: "Users",
  },
  {
    slug: "community-support",
    title: "Community Support",
    description:
      "A growing network of Kandaris supporting each other's growth and success.",
    icon: "HeartHandshake",
  },
];
