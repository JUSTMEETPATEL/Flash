"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Lock, FileJson, Activity, Database } from "lucide-react";

const middlewares = [
  { id: "logger", name: "Logger", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "cors", name: "CORS", icon: GlobeIcon, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "auth", name: "Auth", icon: Lock, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  { id: "json", name: "JSON Body", icon: FileJson, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
];

function GlobeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}

export function MiddlewareFlow() {
  const [activeStage, setActiveStage] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      setActiveStage(0);
      let step = 0;
      interval = setInterval(() => {
        step++;
        if (step > middlewares.length + 1) { // +1 for Handler, +1 for Response
          setIsPlaying(false);
          setActiveStage(-1);
          clearInterval(interval);
        } else {
          setActiveStage(step);
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="my-8 rounded-xl border border-border bg-zinc-950/50 p-6 md:p-8 overflow-hidden">
      <div className="flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-2">
          
          {/* Incoming Request */}
          <div className="flex flex-col items-center gap-2">
            <span className={cn("text-xs font-mono transition-opacity", activeStage === 0 ? "opacity-100 text-primary" : "opacity-50")}>
              REQ
            </span>
            <div className={cn(
              "h-3 w-3 rounded-full bg-primary transition-all duration-300",
               activeStage >= 0 ? "opacity-100 scale-100" : "opacity-30 scale-75"
            )} />
          </div>

          <ArrowRight className="h-4 w-4 text-muted-foreground/30" />

          {/* Middleware Chain */}
          {middlewares.map((mw, index) => {
            const isActive = activeStage === index + 1; // 1-based index for MWs
            const isPassed = activeStage > index + 1;

            return (
              <div key={mw.id} className="flex items-center gap-2">
                <div className={cn(
                  "relative flex flex-col items-center justify-center gap-2 rounded-lg border p-3 w-20 md:w-24 transition-all duration-300",
                  mw.bg, mw.border,
                  isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-zinc-950 scale-110 z-10" : "opacity-70 grayscale-[0.5]"
                )}>
                  <mw.icon className={cn("h-5 w-5", mw.color)} />
                  <span className="text-[10px] font-medium text-foreground">{mw.name}</span>
                  
                  {/* Particle passing through */}
                  {isActive && (
                    <motion.div
                      layoutId="particle"
                      className="absolute inset-0 rounded-lg bg-primary/20"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
                <ArrowRight className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground/30")} />
              </div>
            );
          })}

          {/* Route Handler */}
          <div className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 w-24 transition-all duration-300",
             activeStage === middlewares.length + 1 ? "ring-2 ring-green-500 ring-offset-2 ring-offset-zinc-950 scale-110 z-10 opacity-100" : "opacity-70 grayscale-[0.5]"
          )}>
            <Database className="h-5 w-5 text-green-500" />
            <span className="text-[10px] font-medium text-foreground">Handler</span>
          </div>

          <ArrowRight className="h-4 w-4 text-muted-foreground/30" />

           {/* Outgoing Response */}
           <div className="flex flex-col items-center gap-2">
            <span className={cn("text-xs font-mono transition-opacity", activeStage > middlewares.length + 1 ? "opacity-100 text-green-500" : "opacity-50")}>
              RES
            </span>
            <div className={cn(
              "h-3 w-3 rounded-full bg-green-500 transition-all duration-300",
               activeStage > middlewares.length + 1 ? "opacity-100 scale-100" : "opacity-30 scale-75"
            )} />
          </div>

        </div>

        <button
          onClick={() => setIsPlaying(true)}
          disabled={isPlaying}
          className="mt-8 rounded-full border border-border bg-secondary/50 px-6 py-2 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
        >
          {isPlaying ? "Running..." : "Simulate Request"}
        </button>
      </div>
    </div>
  );
}
