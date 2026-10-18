"use client";

import { X } from "lucide-react";
import { useState } from "react";

export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 32;

interface TagsInputProps {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
}

function normalize(tag: string): string {
  return tag.trim().replace(/^#/, "").toLowerCase().replace(/\s+/g, "-").slice(0, MAX_TAG_LENGTH);
}

export function TagsInput({ id, value, onChange }: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const full = value.length >= MAX_TAGS;

  function add(raw: string) {
    const next = [...value];
    for (const part of raw.split(",")) {
      const tag = normalize(part);
      if (tag && !next.includes(tag) && next.length < MAX_TAGS) next.push(tag);
    }
    onChange(next);
    setDraft("");
  }

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 transition-colors focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 dark:border-zinc-800 dark:bg-zinc-900">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-zinc-100 py-0.5 pr-1 pl-2 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          #{tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            className="rounded p-0.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        disabled={full}
        onChange={(event) => {
          const text = event.target.value;
          if (text.includes(",")) add(text);
          else setDraft(text);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add(draft);
          } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft && add(draft)}
        placeholder={full ? `Up to ${MAX_TAGS} tags` : value.length === 0 ? "linux, go, networking" : "Add tag"}
        className="min-w-24 flex-1 bg-transparent px-1 text-sm placeholder:text-zinc-400 focus:outline-none"
      />
    </div>
  );
}
