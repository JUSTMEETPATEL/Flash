"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden border-b border-border/40 bg-background px-4 py-20 md:py-32">
       {/* Background Grid - Aceternity Style */}
      <div className="absolute inset-0 z-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-xl"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          v1.0 is now live
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
        >
          The Fastest <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Node.js Framework</span>
          <br /> For Modern Apps.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Build type-safe, high-performance APIs with the developer experience of Node.js and the raw speed of C++. Zero config, 10x faster.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
        >
           <Link
            href="/docs/quick-start"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-primary px-8 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"
          >
            <span className="mr-2">Get Started</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            <div className="absolute inset-0 -z-10 translate-y-[100%] bg-gradient-to-r from-violet-600 to-indigo-600 transition-transform duration-300 group-hover:translate-y-0" />
          </Link>
          
          <Link
            href="/docs"
            className="group inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Terminal className="mr-2 h-4 w-4" />
            Documentation
          </Link>
        </motion.div>

        {/* Tech Stack / Trust badges could go here */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1, delay: 0.8 }}
           className="mt-20 flex items-center justify-center gap-8 opacity-50 grayscale transition-all hover:grayscale-0"
        >
            {/* Logos for Node, C++, TypeScript, etc. - using text/icons for now */}
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
               <span className="text-xl">Typescript</span>
            </div>
            <div className="h-4 w-[1px] bg-border"></div>
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
               <span className="text-xl">C++ 20</span>
            </div>
            <div className="h-4 w-[1px] bg-border"></div>
             <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
               <span className="text-xl">N-API</span>
            </div>
        </motion.div>
      </div>
    </section>
  );
}
