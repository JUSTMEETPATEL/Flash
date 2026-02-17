"use client";

import { Check, Copy, FileText } from "lucide-react";
import { useState } from "react";
import TurndownService from "turndown";
import { cn } from "@/lib/utils";

export function CopyPageButton({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleCopy = async () => {
    try {
      setStatus("loading");
      const content = document.getElementById("docs-content");
      if (!content) {
        console.error("Content element not found");
        setStatus("error");
        return;
      }

      const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        emDelimiter: "*",
      });

      // Custom rule to handle our CodeBlock structure if needed
      // For now, Turndown handles <pre><code> pretty well by default with 'fenced' style

      const markdown = turndownService.turndown(content.innerHTML);
      
      // Add a title if possible
      const title = document.title || "Documentation";
      const finalContent = `# ${title}\n\n${markdown}`;

      await navigator.clipboard.writeText(finalContent);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      console.error("Failed to copy page:", e);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={status === "loading"}
      className={cn(
        "flex items-center gap-2 rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2",
        status === "success" && "bg-green-600 text-white hover:bg-green-600",
        status === "error" && "bg-destructive text-destructive-foreground hover:bg-destructive",
        className
      )}
    >
      {status === "success" ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copied MD
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Copy Page
        </>
      )}
    </button>
  );
}
