"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowDown, Database, Globe, Layers, Server, Shield } from "lucide-react";

const steps = [
  {
    id: "request",
    title: "Incoming Request",
    icon: Globe,
    color: "bg-blue-500",
    desc: "Client sends HTTP request (GET, POST, etc.)",
    details: "Node.js http.Server receives the raw socket data and parses headers.",
  },
  {
    id: "server",
    title: "Flash Server",
    icon: Server,
    color: "bg-purple-500",
    desc: "Flash instance receives request",
    details: "Constructs Request and Response objects. Initializes context.",
  },
  {
    id: "middleware",
    title: "Middleware Chain",
    icon: Shield,
    color: "bg-yellow-500",
    desc: "Global middleware runs",
    details: "Logger → CORS → Body Parser → Auth. Any step can reject the request.",
  },
  {
    id: "router",
    title: "Router",
    icon: Layers,
    color: "bg-orange-500",
    desc: "Route matching",
    details: "Matches method and path (e.g., /users/:id). Extracts typesafe parameters.",
  },
  {
    id: "handler",
    title: "Route Handler",
    icon: Database,
    color: "bg-green-500",
    desc: "Business logic executes",
    details: "Your async code runs. Interacts with DB, services, and sends JSON response.",
  },
];

export function RequestLifecycle() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <div className="my-8 rounded-xl border border-border bg-zinc-950/50 p-6 md:p-8">
      <div className="flex flex-col gap-0 relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-zinc-800 hidden md:block" />

        {steps.map((step, index) => {
          const isActive = activeStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 group">
              <div 
                className="flex gap-4 md:gap-8 cursor-pointer"
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Icon Marker */}
                <div className={cn(
                  "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-zinc-900 shadow-lg transition-all duration-300",
                  isActive ? step.color : "bg-zinc-900 border-zinc-800"
                )}>
                  <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-zinc-500")} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className={cn(
                    "rounded-lg border p-4 transition-all duration-300",
                    isActive 
                      ? "bg-zinc-900/80 border-zinc-700 shadow-lg scale-[1.02]" 
                      : "bg-transparent border-transparent hover:bg-zinc-900/30"
                  )}>
                    <h3 className={cn("font-semibold text-base mb-1", isActive ? "text-white" : "text-zinc-300")}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                    
                    <motion.div
                      initial={false}
                      animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t border-zinc-800 text-sm text-zinc-400">
                        {step.details}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 ml-[-10px] top-[3.5rem] hidden md:flex justify-center w-5">
                   <ArrowDown className="h-4 w-4 text-zinc-800" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground md:hidden">
        Tap a step to see details
      </p>
    </div>
  );
}
