"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { admin, ApiError } from "@/lib/browser-api";
import { formatCount, formatDate } from "@/lib/format";
import { slugify } from "@/lib/slug";
import type { AdminPost, PostInput, PostStatus } from "@/lib/types";

import { CoverUpload } from "./cover-upload";
import { MarkdownEditor } from "./markdown-editor";
import { PostStats } from "./post-stats";
import { useSession } from "./session";
import { TagsInput } from "./tags-input";

const MAX_TITLE = 200;
const MAX_SUMMARY = 500;

const EMPTY_INPUT: PostInput = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  cover_image_url: "",
  tags: [],
  status: "draft",
};

function toInput(post: AdminPost): PostInput {
  return {
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    content: post.content,
    cover_image_url: post.cover_image_url,
    tags: post.tags,
    status: post.status,
  };
}

function sameInput(a: PostInput, b: PostInput): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function validate(input: PostInput, status: PostStatus): string | null {
  if (!input.title.trim()) return "Give the post a title.";
  if (status === "published" && !input.content.trim()) return "A published post needs some content.";
  return null;
}

/** Warns before leaving the page, or following an in-app link, with unsaved changes. */
function useUnsavedChangesGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const message = "You have unsaved changes. Leave anyway?";

    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;
      if (new URL(anchor.href).origin !== window.location.origin) return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}

export function PostEditor({ post }: { post?: AdminPost }) {
  const router = useRouter();
  const toast = useToast();
  const { reportError } = useSession();

  const [saved, setSaved] = useState<AdminPost | undefined>(post);
  const [input, setInput] = useState<PostInput>(post ? toInput(post) : EMPTY_INPUT);
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const baseline = saved ? toInput(saved) : EMPTY_INPUT;
  const dirty = !sameInput(input, baseline);
  const isPublished = saved?.status === "published";
  useUnsavedChangesGuard(dirty && !saving && !deleting);

  const update = <K extends keyof PostInput>(key: K, value: PostInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));

  function onTitleChange(title: string) {
    setInput((current) => ({ ...current, title, slug: slugEdited ? current.slug : slugify(title) }));
  }

  const save = useCallback(
    async (status: PostStatus) => {
      const payload: PostInput = { ...input, status, title: input.title.trim(), summary: input.summary.trim() };
      const problem = validate(payload, status);
      if (problem) {
        setError(problem);
        return;
      }

      setSaving(true);
      setError("");
      try {
        const result = saved ? await admin.updatePost(saved.id, payload) : await admin.createPost(payload);
        setSaved(result);
        setInput(toInput(result));
        setSlugEdited(true);
        toast.success(
          status === "published"
            ? saved?.status === "published"
              ? "Post updated."
              : "Post published."
            : saved?.status === "published"
              ? "Post moved back to drafts."
              : "Draft saved.",
        );
        if (!saved) router.replace(`/admin/posts/${result.id}`);
      } catch (cause) {
        if (cause instanceof ApiError && (cause.status === 400 || cause.status === 409)) {
          setError(cause.message);
        } else {
          reportError(cause, "Could not save the post.");
        }
      } finally {
        setSaving(false);
      }
    },
    [input, saved, router, toast, reportError],
  );

  // Ctrl/Cmd+S saves without changing the post's status.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!saving) save(saved?.status ?? "draft");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save, saving, saved?.status]);

  async function remove() {
    if (!saved) return;
    setDeleting(true);
    try {
      await admin.deletePost(saved.id);
      toast.success("Post deleted.");
      router.replace("/admin/posts");
    } catch (cause) {
      reportError(cause, "Could not delete the post.");
      setDeleting(false);
    }
  }

  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!post) titleRef.current?.focus();
  }, [post]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{saved ? "Edit post" : "New post"}</h1>
          {saved && <Badge tone={isPublished ? "accent" : "warning"}>{saved.status}</Badge>}
          {dirty && <span className="font-mono text-xs text-zinc-500">unsaved changes</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPublished && saved && (
            <a href={`/posts/${saved.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              <ExternalLink className="size-4" aria-hidden /> View post
            </a>
          )}
          {isPublished ? (
            <Button variant="secondary" onClick={() => save("draft")} disabled={saving}>
              Unpublish
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => save("draft")} disabled={saving}>
              Save draft
            </Button>
          )}
          <Button onClick={() => save("published")} disabled={saving}>
            {saving ? "Saving…" : isPublished ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Field label="Title" htmlFor="title">
            <Input
              id="title"
              ref={titleRef}
              value={input.title}
              maxLength={MAX_TITLE}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="A clear, specific title"
              className="h-11 text-base font-medium"
            />
          </Field>
          <Field label="Summary" htmlFor="summary" hint={`${input.summary.length}/${MAX_SUMMARY} · shown on cards and in link previews`}>
            <Textarea
              id="summary"
              rows={2}
              maxLength={MAX_SUMMARY}
              value={input.summary}
              onChange={(event) => update("summary", event.target.value)}
              placeholder="One or two sentences about the post"
            />
          </Field>
          <div className="space-y-1.5">
            <label htmlFor="content" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Content
            </label>
            <MarkdownEditor id="content" value={input.content} onChange={(content) => update("content", content)} />
          </div>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader title="Settings" />
            <div className="space-y-5 p-5">
              <Field
                label="URL slug"
                htmlFor="slug"
                hint={<span className="break-all font-mono">/posts/{input.slug || "…"}</span>}
              >
                <Input
                  id="slug"
                  value={input.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }}
                  onBlur={() => update("slug", slugify(input.slug) || slugify(input.title))}
                  placeholder="generated-from-title"
                  className="font-mono"
                />
              </Field>
              <Field label="Tags" htmlFor="tags" hint="Press Enter or comma to add.">
                <TagsInput id="tags" value={input.tags} onChange={(tags) => update("tags", tags)} />
              </Field>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Cover image</p>
                <CoverUpload value={input.cover_image_url} onChange={(url) => update("cover_image_url", url)} />
              </div>
            </div>
          </Card>

          {saved && (
            <>
              <Card className="p-5">
                <dl className="grid grid-cols-3 gap-3 text-center">
                  {[
                    ["Views", saved.view_count],
                    ["Likes", saved.like_count],
                    ["Shares", saved.share_count],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
                      <dd className="mt-1 font-mono text-lg font-semibold tabular-nums">{formatCount(Number(value))}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 border-t border-zinc-100 pt-3 font-mono text-xs text-zinc-500 dark:border-zinc-800">
                  created {formatDate(saved.created_at)}
                  {saved.published_at && ` · published ${formatDate(saved.published_at)}`}
                </p>
              </Card>
              <PostStats postId={saved.id} />
              <Button
                variant="ghost"
                onClick={() => setConfirmingDelete(true)}
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash2 className="size-4" aria-hidden /> Delete post
              </Button>
            </>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this post?"
        description="The post and its statistics will be deleted permanently. This cannot be undone."
        confirmLabel="Delete post"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
