"use client";

import { cn } from "@/lib/cn";

interface SegmentedProps<T extends string | number> {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}

/** A compact single-choice toggle group. */
export function Segmented<T extends string | number>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800/80">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            option.value === value
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
