"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Handshake, Users, HeartHandshake, LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { services } from "@/data/services";

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  Handshake,
  Users,
  HeartHandshake,
};

export function ServicesSection() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col items-center gap-3 text-center">
        <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
          What We Offer
        </h2>
        <Link href="/services" className="text-sm font-medium text-accent hover:underline">
          View all services →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, i) => {
          const Icon = ICON_MAP[service.icon];
          return (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.03, rotateX: 2 }}
              style={{ perspective: 800 }}
            >
              <Card className="h-full border-black/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10">
                <CardHeader>
                  {Icon && <Icon className="h-7 w-7 text-primary" />}
                  <CardTitle>
                    <h3 className="font-heading text-base text-primary">
                      {service.title}
                    </h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  {service.description}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
