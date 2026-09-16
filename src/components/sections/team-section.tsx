"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { teamMembers } from "@/data/team";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

export function TeamSection() {
  return (
    <section id="team" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
            The Team Behind Kandari Lab
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group text-center"
            >
              <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full ring-4 ring-transparent transition-all group-hover:ring-primary/30">
                <Image
                  src={member.imageUrl}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-heading font-semibold text-slate-900">
                {member.name}
              </h3>
              <p className="text-sm text-accent">{member.role}</p>
              <p className="mt-2 text-sm text-slate-600">{member.bio}</p>
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
