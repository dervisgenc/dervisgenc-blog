import type { Heading } from "@/lib/markdown";
import { cn } from "@/lib/cn";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  return (
    <nav aria-label="Table of contents" className="space-y-3">
      <p className="font-mono text-xs tracking-wider text-zinc-500 uppercase dark:text-zinc-400">On this page</p>
      <ul className="space-y-2 border-l border-zinc-200 text-sm dark:border-zinc-800">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "-ml-px block border-l border-transparent leading-snug text-zinc-500 transition-colors hover:border-teal-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
                heading.level === 2 ? "pl-3" : "pl-6",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
