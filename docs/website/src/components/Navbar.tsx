import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { LogoText } from "@/components/Logo";

export function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <LogoText />
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
            <Link href="/docs/api" className="hover:text-primary transition-colors">API Reference</Link>

          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="https://github.com/JUSTMEETPATEL/Flash" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/docs">
             <Button variant="default" size="sm">Documentation</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
