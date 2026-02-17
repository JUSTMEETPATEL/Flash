"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";
import { cn } from "@/lib/utils";

export function BentoCard({
  children,
  className,
  title,
  description,
  icon: Icon,
  href,
}: {
  children?: React.ReactNode;
  className?: string;
  title: string;
  description: string;
  icon: any;
  href?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  const Content = (
    <>
      {/* Spotlight Gradient */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50">
          <Icon className="h-5 w-5 text-zinc-100" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-zinc-100">{title}</h3>
        <p className="max-w-sm text-zinc-400 text-sm">{description}</p>
        
        {children && (
            <div className="mt-8 flex-1 flex flex-col justify-end">
                {children}
            </div>
        )}
      </div>
    </>
  );

  if (href) {
      return (
        <a
            href={href}
            className={cn(
                "group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-8 py-8 md:p-10 transition-colors hover:border-zinc-700",
                className
            )}
            onMouseMove={handleMouseMove}
        >
            {Content}
        </a>
      )
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 px-8 py-8 md:p-10",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {Content}
    </div>
  );
}
