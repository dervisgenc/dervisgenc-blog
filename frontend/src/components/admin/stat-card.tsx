import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCount } from "@/lib/format";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  detail?: string;
}

export function StatCard({ label, value, icon: Icon, detail }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
        <Icon className="size-4 text-teal-600 dark:text-teal-400" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value === undefined ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" /> : formatCount(value)}
      </p>
      {detail && <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">{detail}</p>}
    </Card>
  );
}
