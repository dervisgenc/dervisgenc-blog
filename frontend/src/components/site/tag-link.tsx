import Link from "next/link";

import { cn } from "@/lib/cn";

interface TagLinkProps {
  tag: string;
  active?: boolean;
  count?: number;
}

export function TagLink({ tag, active = false, count }: TagLinkProps) {
  return (
    <Link
      href={active ? "/" : `/?tag=${encodeURIComponent(tag)}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs transition-colors",
        active
          ? "bg-teal-600 text-white dark:bg-teal-500 dark:text-zinc-950"
          : "bg-zinc-100 text-zinc-600 hover:bg-teal-50 hover:text-teal-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-teal-500/10 dark:hover:text-teal-300",
      )}
    >
      #{tag}
      {count !== undefined && <span className="opacity-60">{count}</span>}
    </Link>
  );
}
