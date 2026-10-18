import type { LucideIcon } from "lucide-react";

interface NoticeProps {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
}

/** A centred message for empty and error states. */
export function Notice({ icon: Icon, title, children }: NoticeProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-700">
      <div className="mb-4 rounded-xl bg-zinc-100 p-3 text-teal-600 dark:bg-zinc-800/80 dark:text-teal-400">
        <Icon className="size-6" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children && <div className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>}
    </div>
  );
}
