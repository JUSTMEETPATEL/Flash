"use client";

import { motion } from "framer-motion";
import { Server, Globe, MessageSquare, ArrowRightLeft, Shield, Route, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function SimpleCard({
  title,
  description,
  icon: Icon,
  href,
  children,
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
          <Icon className="h-5 w-5 text-zinc-100" />
        </div>
        <h3 className="text-xl font-bold text-zinc-100">{title}</h3>
      </div>
      
      <p className="mt-4 text-zinc-400 text-sm leading-relaxed flex-grow">
        {description}
      </p>

      {children && (
        <div className="mt-6 rounded-md border border-zinc-800/50 bg-zinc-950 p-3 opacity-80 transition-opacity group-hover:opacity-100">
            {children}
        </div>
      )}
      
      <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Read Docs <ChevronRight className="ml-1 h-4 w-4" />
      </div>
    </Link>
  );
}

export default function ApiIndexPage() {
  return (
    <div className="container max-w-5xl py-12 md:py-20">
      <div className="mb-12 text-center">
        <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-foreground"
        >
          API Reference
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Detailed documentation for the core classes and interfaces of the Flash Framework.
        </motion.p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
      >
        <motion.div variants={item} className="h-full">
            <SimpleCard
            title="Server"
            description="The main Flash application class. Handles lifecycle and listening."
            icon={Server}
            href="/docs/api/server"
            >
                <div className="flex items-end gap-2 text-xs font-mono text-zinc-600">
                    <span className="text-purple-400">const</span> app = <span className="text-yellow-200">new Flash</span>();
                </div>
            </SimpleCard>
        </motion.div>

        <motion.div variants={item} className="h-full">
            <SimpleCard
            title="Request"
            description="Type-safe request object. Access body, query, and params with full type inference."
            icon={Globe}
            href="/docs/api/request"
            >
                <div className="flex flex-wrap gap-2">
                    <span className="text-zinc-500 text-xs font-mono">req.body</span>
                    <span className="text-zinc-500 text-xs font-mono">req.query</span>
                    <span className="text-zinc-500 text-xs font-mono">req.params</span>
                </div>
            </SimpleCard>
        </motion.div>

        <motion.div variants={item} className="h-full">
            <SimpleCard
            title="Response"
            description="Enhanced response object for sending JSON, HTML, or streams."
            icon={MessageSquare}
            href="/docs/api/response"
            >
                 <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                         <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                         res.json({"{...}"})
                    </div>
                 </div>
            </SimpleCard>
        </motion.div>

        <motion.div variants={item} className="h-full">
            <SimpleCard
            title="Router"
            description="High-performance radix-tree router."
            icon={Route}
            href="/docs/routing"
            >
                <div className="flex flex-col gap-2 font-mono text-[10px] text-zinc-500">
                     <div className="flex items-center gap-2 rounded bg-zinc-900/50 p-1.5 border border-zinc-800/50">
                        <span className="text-green-400 font-bold">GET</span>
                        <span>/api/users/:id</span>
                     </div>
                     <div className="flex items-center gap-2 rounded bg-zinc-900/50 p-1.5 border border-zinc-800/50">
                        <span className="text-blue-400 font-bold">POST</span>
                        <span>/api/auth/login</span>
                     </div>
                </div>
            </SimpleCard>
        </motion.div>

        <motion.div variants={item} className="h-full">
            <SimpleCard
            title="Middleware"
            description="Pipeline system for global and route-specific logic."
            icon={ArrowRightLeft}
            href="/docs/middleware"
            >
                 <div className="flex items-center gap-1 overflow-hidden font-mono text-[10px] text-zinc-400 opacity-70">
                    <div className="truncate rounded border border-zinc-700 bg-zinc-800 px-1.5 py-1">Logger</div>
                    <ArrowRightLeft className="h-3 w-3 shrink-0 text-zinc-600" />
                    <div className="truncate rounded border border-zinc-700 bg-zinc-800 px-1.5 py-1">Auth</div>
                    <ArrowRightLeft className="h-3 w-3 shrink-0 text-zinc-600" />
                    <div className="truncate rounded border border-zinc-700 bg-zinc-800 px-1.5 py-1">Handler</div>
                 </div>
            </SimpleCard>
        </motion.div>
        
        <motion.div variants={item} className="h-full">
            <SimpleCard
            title="Types"
            description="Core TypeScript definitions."
            icon={Shield}
            href="/docs/api/server#types"
            >
                <div className="flex items-center justify-between gap-2 opacity-60">
                     <div className="flex items-center gap-2 rounded bg-zinc-900 p-1.5 text-[10px] font-mono text-zinc-400 border border-zinc-800">
                        <span className="text-blue-400">type</span> Handler
                     </div>
                     <div className="flex items-center gap-2 rounded bg-zinc-900 p-1.5 text-[10px] font-mono text-zinc-400 border border-zinc-800">
                        <span className="text-blue-400">interface</span> Context
                     </div>
                </div>
            </SimpleCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
