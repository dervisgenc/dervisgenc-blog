"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useToast } from "@/components/ui/toast";
import { admin, ApiError } from "@/lib/browser-api";
import type { Session } from "@/lib/types";

interface SessionContextValue {
  session: Session;
  /** Reports a failed admin request: expired sessions go back to login, anything else becomes a toast. */
  reportError: (error: unknown, fallback?: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function loginPath(next: string): string {
  return `/admin/login?next=${encodeURIComponent(next)}`;
}

/** Only admin paths are accepted as a post-login destination. */
export function safeNextPath(next: string | null): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

/** Renders its children only once a valid admin session is confirmed. */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let cancelled = false;
    admin
      .session()
      .then((current) => {
        if (!cancelled) setSession(current);
      })
      .catch(() => {
        if (!cancelled) router.replace(loginPath(pathname));
      });
    return () => {
      cancelled = true;
    };
    // The session is checked once when the panel mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reportError = useCallback(
    (error: unknown, fallback = "Something went wrong.") => {
      if (error instanceof ApiError && error.status === 401) {
        router.replace(loginPath(pathname));
        return;
      }
      toast.error(error instanceof ApiError ? error.message : fallback);
    },
    [router, pathname, toast],
  );

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-zinc-500" role="status">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        <span className="sr-only">Checking session…</span>
      </div>
    );
  }

  return <SessionContext.Provider value={{ session, reportError }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside <SessionGate>");
  return context;
}
