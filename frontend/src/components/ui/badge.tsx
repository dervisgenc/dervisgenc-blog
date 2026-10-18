import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "accent" | "warning";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  accent: "bg-teal-50 text-teal-700 ring-1 ring-teal-600/15 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs", tones[tone])}>
      {children}
    </span>
  );
}
