"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

export function ArchitectureDiagram() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [stage, setStage] = useState<"idle" | "request" | "processing" | "response">("idle");

  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStage("request");

    // Sequence timing
    setTimeout(() => setStage("processing"), 1000); // Hit C++
    setTimeout(() => setStage("response"), 2500);   // Processed, return
    setTimeout(() => {
      setStage("idle");
      setIsAnimating(false);
    }, 3500); // Finished
  };

  return (
    <div className="relative my-8 w-full overflow-hidden rounded-xl border border-border bg-zinc-950/50 p-6 md:p-10">
      <div className="mb-8 flex justify-center">
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className={cn(
            "flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-6 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20",
            isAnimating && "opacity-50 cursor-not-allowed"
          )}
        >
          <Send className="h-4 w-4" />
          {isAnimating ? "Processing Request..." : "Send Request"}
        </button>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-40">
        {/* TS Server Node (Left) */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-blue-500/30 bg-blue-500/10 shadow-[0_0_30px_-5px_var(--color-blue-500)] shadow-blue-500/20">
            <span className="text-4xl font-bold text-blue-500">TS</span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Node.js Server</p>
            <p className="text-xs text-muted-foreground">User Land</p>
          </div>
        </div>

        {/* N-API Bridge (Path) */}
        <div className="absolute left-[6rem] right-[6rem] top-[3rem] -z-0 hidden md:block">
          {/* Roadway lines */}
          <div className="h-2 w-full rounded-full bg-zinc-800" />
          <div className="absolute top-1/2 mt-[-1px] h-[2px] w-full -translate-y-1/2 border-t border-dashed border-zinc-600" />
          
          {/* Label */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2 text-xs font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950 px-2">
            N-API Bridge
          </div>

          {/* Moving Plane/Object */}
          <motion.div
            className="absolute top-1/2 -mt-4 ml-[-16px] text-white"
            initial={{ left: "0%", rotate: 90, scale: 0 }}
            animate={{
              left: stage === "idle" ? "0%" : stage === "request" ? "100%" : stage === "processing" ? "100%" : "0%",
              rotate: stage === "response" ? 270 : 90,
              scale: stage === "idle" ? 0 : 1,
            }}
            transition={{
              duration: stage === "processing" ? 0 : 1,
              ease: "easeInOut",
            }}
          >
             {/* Paper Plane SVG */}
             <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fill-primary stroke-primary drop-shadow-[0_0_10px_var(--color-primary)]"
            >
              <path d="M2 12h20" />
              <path d="M13 5l7 7-7 7" />
             </svg>
             {/* Use a simple arrow or plane conceptual shape if users requested a specific SVG, but Lucide doesn't have a perfect "paper plane" that points right easily without rotation.
                 Wait, user asked for "plane flies in motion". I'll use a custom SVG path for a paper plane.
             */}
          </motion.div>
          
           {/* Custom Paper Plane that looks better */}
           <motion.div
            className="absolute top-1/2 -mt-3 ml-[-16px] text-blue-400"
            initial={{ left: "0%", rotate: 0, opacity: 0 }}
            animate={{
              left: stage === "idle" ? "0%" : stage === "request" ? "95%" : stage === "processing" ? "95%" : "5%",
              rotate: stage === "response" ? 180 : 0,
              opacity: stage === "idle" ? 0 : 1,
            }}
            transition={{
              duration: stage === "processing" ? 0 : 1,
              ease: "easeInOut",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 drop-shadow-lg"
            >
              <path d="M2 12l20-9-9 20-2-9-9-2z" />
            </svg>
          </motion.div>
        </div>

        {/* C++ Native Base (Right) */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <motion.div 
            className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-red-500/30 bg-red-500/10 shadow-[0_0_30px_-5px_var(--color-red-500)] shadow-red-500/20"
            animate={{
              scale: stage === "processing" ? [1, 1.1, 1] : 1,
              borderColor: stage === "processing" ? "rgba(239, 68, 68, 0.8)" : "rgba(239, 68, 68, 0.3)",
              boxShadow: stage === "processing" ? "0 0 50px -5px rgba(239, 68, 68, 0.5)" : "0 0 30px -5px rgba(239, 68, 68, 0.2)",
            }}
            transition={{ duration: 0.5, repeat: stage === "processing" ? Infinity : 0 }}
          >
            <span className="text-4xl font-bold text-red-500">C++</span>
          </motion.div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Native Base</p>
            <p className="text-xs text-muted-foreground">High Performance</p>
          </div>
        </div>
      </div>
      
      {/* Mobile Fallback (Simple text animation) */}
      <div className="mt-8 text-center text-sm md:hidden">
        {stage === "idle" && "Ready to send."}
        {stage === "request" && "Sending to C++ layer..."}
        {stage === "processing" && "Processing in native thread..."}
        {stage === "response" && "Returning response..."}
      </div>
    </div>
  );
}
