"use client";

import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { admin } from "@/lib/browser-api";

import { useSession } from "./session";

export const ACCEPTED_IMAGES = "image/jpeg,image/png,image/gif,image/webp";

interface CoverUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function CoverUpload({ value, onChange }: CoverUploadProps) {
  const { reportError } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await admin.upload(file);
      onChange(result.url);
    } catch (error) {
      reportError(error, "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGES}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => upload(event.target.files?.[0])}
      />
      {value ? (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Cover preview" className="aspect-[2/1] w-full object-cover" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Upload className="size-3.5" aria-hidden />}
              Replace
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange("")} disabled={uploading}>
              <Trash2 className="size-3.5" aria-hidden /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            upload(event.dataTransfer.files[0]);
          }}
          disabled={uploading}
          className="flex aspect-[2/1] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-500 transition-colors hover:border-teal-500 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-teal-300"
        >
          {uploading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ImagePlus className="size-5" aria-hidden />}
          {uploading ? "Uploading…" : "Upload a cover image"}
          <span className="text-xs text-zinc-400">JPEG, PNG, GIF or WebP · up to 10 MB</span>
        </button>
      )}
    </div>
  );
}
