"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const dataReqs = [
  { name: "Express", value: 25088, color: "#374151" },
  { name: "Fastify", value: 78000, color: "#374151" },
  { name: "Flash", value: 152988, color: "#EAB308" }, // Amber-500
];

const dataLatency = [
  { name: "Express", value: 3.7, color: "#374151" },
  { name: "Fastify", value: 0.8, color: "#374151" },
  { name: "Flash", value: 0.084, color: "#EAB308" },
];

export function BenchmarkGraph() {
  const [metric, setMetric] = useState<"reqs" | "latency">("reqs");

  const currentData = metric === "reqs" ? dataReqs : dataLatency;
  const unit = metric === "reqs" ? "req/sec" : "ms (lower is better)";

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
      <div className="flex justify-center space-x-4 mb-8">
        <Button
          variant={metric === "reqs" ? "default" : "outline"}
          onClick={() => setMetric("reqs")}
          size="sm"
        >
          Throughput (Req/s)
        </Button>
        <Button
          variant={metric === "latency" ? "default" : "outline"}
          onClick={() => setMetric("latency")}
          size="sm"
        >
          Latency (P50)
        </Button>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
            <XAxis type="number" stroke="#a1a1aa" fontSize={12} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#fafafa"
              fontSize={14}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
                color: "#fafafa",
              }}
              itemStyle={{ color: "#fafafa" }}
              labelStyle={{ color: "#fafafa" }}
              cursor={{ fill: "transparent" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {currentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center text-sm text-zinc-500 mt-4">
        {metric === "reqs"
          ? "Higher is better. Tested on M1 Max."
          : "Lower is better. P50 Latency."}
      </div>
    </div>
  );
}
