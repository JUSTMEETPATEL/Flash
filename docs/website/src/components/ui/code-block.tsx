import { getHighlighter } from "@/lib/highlighter";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export async function CodeBlock({
  code,
  language = "typescript",
  filename,
  className,
}: CodeBlockProps) {
  const highlighter = await getHighlighter();
  const html = highlighter.codeToHtml(code, {
    lang: language,
    theme: "github-dark",
  });

  return (
    <div className={cn("relative my-6 overflow-hidden rounded-lg border bg-[#0d1117]", className)}>
      {filename && (
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <span>{filename}</span>
        </div>
      )}
      <div className="relative">
        <div className="absolute right-4 top-4 z-10">
          <CopyButton text={code} className="border-border/40 bg-background/20 backdrop-blur-sm hover:bg-background/40" />
        </div>
        <div
          className="overflow-x-auto p-4 text-sm [&>pre]:bg-transparent! [&>pre]:p-0!"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
