"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AnimatedCounter } from "./animated-counter";
import { impactStats, impactTrend, regionImpact } from "@/data/impact";

export function ImpactSection() {
  return (
    <section id="impact" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
            Our Impact So Far
          </h2>
        </div>

        <div className="mb-16 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {impactStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-semibold text-primary">
              Growth Over Time
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={impactTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="peopleTrained"
                  stroke="#006A4E"
                  strokeWidth={2.5}
                  dot={false}
                  name="People Trained"
                />
                <Line
                  type="monotone"
                  dataKey="partners"
                  stroke="#F42A41"
                  strokeWidth={2.5}
                  dot={false}
                  name="Partners"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-semibold text-primary">
              Reach by Region
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={regionImpact}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="region" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="peopleReached" fill="#FF9100" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
