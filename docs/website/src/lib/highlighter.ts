import { createHighlighter, Highlighter } from "shiki";

let highlighter: Highlighter | null = null;

export async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark"],
      langs: ["typescript", "javascript", "bash", "json", "cpp"],
    });
  }
  return highlighter;
}
