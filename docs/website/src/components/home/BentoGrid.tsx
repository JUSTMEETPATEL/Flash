"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { Zap, ShieldCheck, Cpu, Code2 } from "lucide-react";

import { BentoCard } from "@/components/ui/bento-card";

// --- Main Grid ---
export function BentoGrid() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Flash?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
                Engineered for speed, safety, and developer happiness.
            </p>
        </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
        {/* Card 1: Performance (Large) */}
        <BentoCard
          title="Hyper Performance"
          description="Built on C++ worker threads and epoll. Flash creates a dedicated thread pool for I/O, bypassing the Node.js event loop overhead for critical paths."
          icon={Zap}
          className="md:col-span-2"
        >
          <div className="relative mt-4 h-48 w-full overflow-hidden rounded-lg bg-zinc-900/50 p-4 border border-zinc-800/50">
             <div className="flex h-full flex-col justify-end gap-2">
                {/* Bar Chart Simulation */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="w-16 text-xs text-zinc-500">Flash</span>
                        <div className="h-6 w-[90%] rounded bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse"></div>
                        <span className="text-xs font-mono text-blue-400">173k/s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-16 text-xs text-zinc-500">Fastify</span>
                        <div className="h-6 w-[45%] rounded bg-zinc-800"></div>
                        <span className="text-xs font-mono text-zinc-600">80k/s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-16 text-xs text-zinc-500">Express</span>
                        <div className="h-6 w-[15%] rounded bg-zinc-800"></div>
                        <span className="text-xs font-mono text-zinc-600">14k/s</span>
                    </div>
                </div>
             </div>
          </div>
        </BentoCard>

        {/* Card 2: Type Safety */}
        <BentoCard
          title="100% Type Safe"
          description="Automatic type inference for request bodies, query parameters, and route params. No more `any`."
          icon={ShieldCheck}
          className="md:col-span-1"
        >
             <div className="relative mt-4 overflow-hidden rounded-lg bg-[#0d1117] p-3 text-xs font-mono text-zinc-300 border border-zinc-800">
                <span className="text-purple-400">interface</span> <span className="text-yellow-200">User</span> {"{"}
                <br />
                &nbsp;&nbsp;id: <span className="text-blue-400">number</span>;
                <br />
                {"}"}
                <br />
                <br />
                <span className="text-zinc-500">// Auto-validated</span>
                <br />
                <span className="text-purple-400">const</span> user: <span className="text-yellow-200">User</span> = req.body;
             </div>
        </BentoCard>

        {/* Card 3: Deep Native Integration */}
        <BentoCard
          title="C++ Powered"
          description="Leveraging N-API to bind directly to C++ logic. Write computationally expensive tasks in C++ and call them from TS."
          icon={Cpu}
          className="md:col-span-1"
        >
             <div className="flex h-32 items-center justify-center rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                <div className="relative h-16 w-16">
                     <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20"></div>
                     <div className="relative flex h-full w-full items-center justify-center rounded-full bg-red-950 border border-red-500/30">
                        <span className="font-bold text-red-500">C++</span>
                     </div>
                </div>
             </div>
        </BentoCard>

         {/* Card 4: Developer Experience */}
         <BentoCard
          title="Zero Config DX"
          description="Comes with everything you need: Router, Middleware, Body Parser, and CORS. No complex setup or boilerplate."
          icon={Code2}
          className="md:col-span-2"
        >
             <div className="grid grid-cols-2 gap-4 mt-4">
                 <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50 border border-zinc-800/50">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-zinc-300">Hot Reloading</span>
                 </div>
                 <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50 border border-zinc-800/50">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-zinc-300">File-based Routing</span>
                 </div>
                 <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50 border border-zinc-800/50">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-zinc-300">Middleware Support</span>
                 </div>
                 <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/50 border border-zinc-800/50">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-zinc-300">Modern CLI</span>
                 </div>
             </div>
        </BentoCard>
      </div>
    </section>
  );
}
