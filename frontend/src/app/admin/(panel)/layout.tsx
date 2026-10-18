import { AdminNav } from "@/components/admin/admin-nav";
import { SessionGate } from "@/components/admin/session";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGate>
      <div className="min-h-dvh bg-zinc-50/60 dark:bg-zinc-950">
        <AdminNav />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </SessionGate>
  );
}
