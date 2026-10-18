"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

interface CodeBlockProps {
  language?: string;
  children: React.ReactNode;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = preRef.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; the code stays selectable.
    }
  }

  return (
    <div className="not-prose group relative my-6 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-1.5 dark:border-zinc-800">
        <span className="font-mono text-[11px] tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          {language ?? "text"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-200/70 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre ref={preRef} className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
