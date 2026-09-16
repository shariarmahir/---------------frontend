"use client";

import { motion } from "framer-motion";
import { Target, Eye, Flag, LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { missionPillars } from "@/data/mission";

const ICON_MAP: Record<string, LucideIcon> = {
  Target,
  Eye,
  Flag,
};

export function MissionSection() {
  return (
    <section id="mission" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
          Why Kandari Lab Exists
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {missionPillars.map((pillar, i) => {
          const Icon = ICON_MAP[pillar.icon];
          return (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full border-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <CardHeader>
                  {Icon && <Icon className="h-8 w-8 text-accent" />}
                  <CardTitle>
                    <h3 className="font-heading text-primary">
                      {pillar.title}
                    </h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-600">{pillar.body}</CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
