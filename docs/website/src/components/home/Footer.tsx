"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { LogoText } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-zinc-950 py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col gap-2">
            <LogoText />
            <p className="text-sm text-zinc-500">
              The fastest Node.js framework. Period.
            </p>
          </div>

          <div className="flex gap-8">
             <div className="flex flex-col gap-2">
                <h4 className="font-semibold text-zinc-100">Product</h4>
                <Link href="/docs" className="text-sm text-zinc-400 hover:text-primary">Documentation</Link>
                <Link href="/docs/quick-start" className="text-sm text-zinc-400 hover:text-primary">Quick Start</Link>
                <Link href="/docs/architecture" className="text-sm text-zinc-400 hover:text-primary">Architecture</Link>
             </div>
             <div className="flex flex-col gap-2">
                <h4 className="font-semibold text-zinc-100">Community</h4>
                <Link href="https://github.com/JUSTMEETPATEL/Flash" className="text-sm text-zinc-400 hover:text-primary">GitHub</Link>
             </div>
          </div>

          <div className="flex gap-4">
            <Link href="https://github.com/JUSTMEETPATEL/Flash" target="_blank" className="text-zinc-400 hover:text-white transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border/20 pt-8 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Flash Framework. MIT License.
        </div>
      </div>
    </footer>
  );
}
