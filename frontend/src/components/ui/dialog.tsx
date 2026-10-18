"use client";

import { useEffect, useRef } from "react";

import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A modal confirmation built on the native <dialog> element. */
export function ConfirmDialog({ open, title, description, confirmLabel, busy, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-xl backdrop:bg-zinc-950/50 backdrop:backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <div className="space-y-2 p-5">
        <h2 id="confirm-dialog-title" className="text-base font-semibold">
          {title}
        </h2>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">{description}</div>
      </div>
      <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} disabled={busy}>
          {busy ? "Working…" : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
