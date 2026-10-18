import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

const fieldClasses =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldClasses, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldClasses, "py-2 leading-relaxed", className)} {...props} />;
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  );
}
