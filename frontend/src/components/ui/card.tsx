import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60", className)}
      {...props}
    />
  );
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
      <h2 className="text-sm font-semibold">{title}</h2>
      {action}
    </div>
  );
}
