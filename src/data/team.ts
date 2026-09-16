export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: "Rafiul Islam",
    role: "Founder & CEO",
    bio: "Building Kandari Lab to connect Bangladeshi talent with real opportunity.",
    imageUrl: "/team/placeholder-1.svg",
    linkedinUrl: "https://linkedin.com",
  },
  {
    name: "Nusrat Jahan",
    role: "Co-Founder & COO",
    bio: "Leads partnerships and on-the-ground programs across Bangladesh.",
    imageUrl: "/team/placeholder-2.svg",
    linkedinUrl: "https://linkedin.com",
  },
  {
    name: "Tanvir Ahmed",
    role: "Head of Product",
    bio: "Designs the Kandari platform experience for learners and partners.",
    imageUrl: "/team/placeholder-3.svg",
    linkedinUrl: "https://linkedin.com",
  },
  {
    name: "Farzana Karim",
    role: "Head of Community",
    bio: "Grows and supports the Kandari community across every district.",
    imageUrl: "/team/placeholder-4.svg",
    linkedinUrl: "https://linkedin.com",
  },
];
