"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { cn } from "@/lib/cn";

type ToastTone = "success" | "error";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (tone: ToastTone, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current.slice(-2), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ success: (message) => show("success", message), error: (message) => show("error", message) }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg dark:bg-zinc-900",
              toast.tone === "success" ? "border-teal-500/30" : "border-red-500/40",
            )}
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
            )}
            <p className="flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
