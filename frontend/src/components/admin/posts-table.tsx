"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { admin } from "@/lib/browser-api";
import { formatCount, formatDate, plural } from "@/lib/format";
import type { AdminPostSummary, PostStatus } from "@/lib/types";

import { Segmented } from "./segmented";
import { useSession } from "./session";
import { useAdminQuery } from "./use-admin-query";

type StatusFilter = PostStatus | "all";

const FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function PostsTable() {
  const toast = useToast();
  const { reportError } = useSession();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<AdminPostSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, loading, reload } = useAdminQuery(`posts-${status}-${query}-${page}`, () =>
    admin.listPosts({ status: status === "all" ? undefined : status, q: query || undefined, page, pageSize: PAGE_SIZE }),
  );

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await admin.deletePost(pendingDelete.id);
      toast.success(`Deleted “${pendingDelete.title}”.`);
      setPendingDelete(null);
      reload();
    } catch (error) {
      reportError(error, "Could not delete the post.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{data ? plural(data.total, "post") : "Loading…"}</p>
        </div>
        <Link href="/admin/posts/new" className={buttonClasses("primary", "md")}>
          <Plus className="size-4" aria-hidden /> New post
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Status"
          value={status}
          options={FILTERS}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search posts"
            aria-label="Search posts"
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900">
              <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                <th scope="col" className="px-5 py-3 font-medium">Title</th>
                <th scope="col" className="px-3 py-3 font-medium">Status</th>
                <th scope="col" className="px-3 py-3 font-medium">Updated</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Views</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Likes</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Shares</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data?.items.map((post) => (
                <tr key={post.id} className="transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-900/60">
                  <td className="max-w-xs px-5 py-3">
                    <Link href={`/admin/posts/${post.id}`} className="block truncate font-medium hover:text-teal-700 dark:hover:text-teal-300">
                      {post.title}
                    </Link>
                    <span className="block truncate font-mono text-xs text-zinc-500">/posts/{post.slug}</span>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={post.status === "published" ? "accent" : "warning"}>{post.status}</Badge>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-zinc-500 dark:text-zinc-400">{formatDate(post.updated_at)}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">{formatCount(post.view_count)}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">{formatCount(post.like_count)}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">{formatCount(post.share_count)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/posts/${post.id}`} className={buttonClasses("ghost", "icon")} aria-label={`Edit ${post.title}`}>
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      {post.status === "published" && (
                        <a
                          href={`/posts/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonClasses("ghost", "icon")}
                          aria-label={`View ${post.title}`}
                        >
                          <ExternalLink className="size-4" aria-hidden />
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPendingDelete(post)}
                        aria-label={`Delete ${post.title}`}
                        className="hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.items.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {query || status !== "all" ? "No posts match these filters." : "No posts yet — write the first one."}
          </p>
        )}
        {!data && loading && <div className="m-5 h-40 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />}
      </Card>

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <span className="font-mono text-xs text-zinc-500">
            page {data.page} / {data.total_pages}
          </span>
          <Button variant="secondary" size="icon" onClick={() => setPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setPage(page + 1)}
            disabled={page >= data.total_pages}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this post?"
        description={
          <>
            “{pendingDelete?.title}” and its statistics will be deleted permanently. This cannot be undone.
          </>
        }
        confirmLabel="Delete post"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
