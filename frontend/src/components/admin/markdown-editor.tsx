"use client";

import {
  Bold,
  Code,
  Heading2,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  Loader2,
  Quote,
  SquareCode,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";

import { Markdown } from "@/components/post/markdown";
import { admin } from "@/lib/browser-api";
import { cn } from "@/lib/cn";
import { countWords, readingMinutes } from "@/lib/markdown";

import { ACCEPTED_IMAGES } from "./cover-upload";
import { Segmented } from "./segmented";
import { useSession } from "./session";

type ViewMode = "write" | "preview" | "split";

interface Edit {
  /** Text that replaces the current selection. */
  text: string;
  /** Selection inside `text` after the edit, relative to its start. */
  select: [number, number];
}

type Action = (selected: string) => Edit;

const wrap =
  (marker: string, placeholder: string): Action =>
  (selected) => {
    const inner = selected || placeholder;
    return { text: `${marker}${inner}${marker}`, select: [marker.length, marker.length + inner.length] };
  };

const prefixLines =
  (prefix: string, placeholder: string): Action =>
  (selected) => {
    const text = (selected || placeholder)
      .split("\n")
      .map((line) => prefix + line)
      .join("\n");
    return { text, select: selected ? [0, text.length] : [prefix.length, text.length] };
  };

const link: Action = (selected) => {
  const label = selected || "link text";
  const text = `[${label}](https://)`;
  const urlStart = label.length + 3;
  return { text, select: [urlStart, urlStart + "https://".length] };
};

const codeBlock: Action = (selected) => {
  const body = selected || "code";
  const text = `\n\`\`\`bash\n${body}\n\`\`\`\n`;
  return { text, select: [4, 8] };
};

interface Tool {
  label: string;
  icon: LucideIcon;
  action: Action;
  shortcut?: string;
}

const TOOLS: Tool[] = [
  { label: "Heading", icon: Heading2, action: prefixLines("## ", "Heading") },
  { label: "Bold", icon: Bold, action: wrap("**", "bold text"), shortcut: "b" },
  { label: "Italic", icon: Italic, action: wrap("_", "italic text"), shortcut: "i" },
  { label: "Link", icon: LinkIcon, action: link, shortcut: "k" },
  { label: "Quote", icon: Quote, action: prefixLines("> ", "Quote") },
  { label: "Inline code", icon: Code, action: wrap("`", "code") },
  { label: "Code block", icon: SquareCode, action: codeBlock },
  { label: "List", icon: List, action: prefixLines("- ", "List item") },
];

const MODES: Array<{ value: ViewMode; label: string }> = [
  { value: "write", label: "Write" },
  { value: "preview", label: "Preview" },
  { value: "split", label: "Split" },
];

interface MarkdownEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ id, value, onChange }: MarkdownEditorProps) {
  const { reportError } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<ViewMode>("write");
  const [uploading, setUploading] = useState(false);

  function replaceSelection(build: Action) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end } = textarea;
    const edit = build(textarea.value.slice(start, end));

    textarea.focus();
    textarea.setSelectionRange(start, end);
    // insertText keeps the browser's undo history; fall back where unsupported.
    if (!document.execCommand("insertText", false, edit.text)) {
      textarea.setRangeText(edit.text, start, end, "end");
      onChange(textarea.value);
    }
    textarea.setSelectionRange(start + edit.select[0], start + edit.select[1]);
  }

  async function uploadImages(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;
    setMode((current) => (current === "preview" ? "write" : current));
    setUploading(true);
    try {
      for (const file of images) {
        const result = await admin.upload(file);
        const alt = file.name.replace(/\.[^.]+$/, "").replace(/[[\]]/g, "");
        replaceSelection(() => {
          const text = `![${alt}](${result.url})\n`;
          return { text, select: [text.length, text.length] };
        });
      }
    } catch (error) {
      reportError(error, "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    const tool = TOOLS.find((item) => item.shortcut === event.key.toLowerCase());
    if (tool) {
      event.preventDefault();
      replaceSelection(tool.action);
    }
  }

  const words = countWords(value);
  const showWrite = mode !== "preview";
  const showPreview = mode !== "write";

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-2 py-1.5 dark:border-zinc-800">
        <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5">
          {TOOLS.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={() => replaceSelection(tool.action)}
              disabled={!showWrite}
              title={tool.shortcut ? `${tool.label} (Ctrl+${tool.shortcut.toUpperCase()})` : tool.label}
              aria-label={tool.label}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <tool.icon className="size-4" aria-hidden />
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !showWrite}
            title="Upload image"
            aria-label="Upload image"
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGES}
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => uploadImages(Array.from(event.target.files ?? []))}
          />
        </div>
        <Segmented label="Editor view" value={mode} options={MODES} onChange={setMode} />
      </div>

      <div className={cn("grid", mode === "split" && "lg:grid-cols-2 lg:divide-x divide-zinc-200 dark:divide-zinc-800")}>
        {showWrite && (
          <textarea
            id={id}
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            onPaste={(event) => {
              const files = Array.from(event.clipboardData.files);
              if (files.length > 0) {
                event.preventDefault();
                uploadImages(files);
              }
            }}
            onDrop={(event) => {
              const files = Array.from(event.dataTransfer.files);
              if (files.length > 0) {
                event.preventDefault();
                uploadImages(files);
              }
            }}
            placeholder={"Write in Markdown…\n\nPaste or drop images to upload them."}
            spellCheck
            className="min-h-[28rem] w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed placeholder:text-zinc-400 focus:outline-none"
          />
        )}
        {showPreview && (
          <div className="max-h-[48rem] min-h-[28rem] overflow-y-auto p-5">
            {value.trim() ? (
              <Markdown content={value} />
            ) : (
              <p className="text-sm text-zinc-400">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between border-t border-zinc-200 px-4 py-2 font-mono text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>Markdown · GitHub flavoured</span>
        <span>
          {words} words · {readingMinutes(value)} min read
        </span>
      </div>
    </div>
  );
}
