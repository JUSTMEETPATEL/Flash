"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BenchmarkGraph } from "./BenchmarkGraph";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Hero() {
  const [copied, setCopied] = useState(false);
  const installCmd = "npm install flash-framework";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="container relative z-10 px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-400 mb-6 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            v0.1 Alpha Release
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-6">
            C++ Speed. <br />
            TypeScript Ease.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Build high-performance HTTP servers with the raw power of C++ and the developer experience of Node.js.
            <span className="block mt-2 text-primary font-semibold">
              173,000 requests per second.
            </span>
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16">
             <Link href="/docs">
              <Button size="lg" className="h-12 px-8 text-base">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <div
              className="group relative flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-400 transition-colors hover:border-zinc-700 cursor-pointer"
              onClick={handleCopy}
            >
              <Terminal className="h-4 w-4" />
              <span>{installCmd}</span>
              <span className={cn("absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded transition-opacity", copied ? "opacity-100" : "opacity-0")}>
                Copied!
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12"
        >
            <BenchmarkGraph />
        </motion.div>
      </div>
      
        {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-[128px] -z-10 opacity-50"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] -z-10 opacity-50"></div>
    </section>
  );
}
