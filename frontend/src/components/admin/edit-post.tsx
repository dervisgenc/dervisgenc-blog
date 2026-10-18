"use client";

import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonClasses } from "@/components/ui/button";
import { admin, ApiError } from "@/lib/browser-api";
import type { AdminPost } from "@/lib/types";

import { PostEditor } from "./post-editor";
import { useSession } from "./session";

export function EditPost({ id }: { id: number }) {
  const { reportError } = useSession();
  const [post, setPost] = useState<AdminPost>();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    admin
      .getPost(id)
      .then((result) => {
        if (!cancelled) setPost(result);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) setMissing(true);
        else reportError(error, "Could not load the post.");
      });
    return () => {
      cancelled = true;
    };
  }, [id, reportError]);

  if (missing) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <FileQuestion className="size-8 text-zinc-400" aria-hidden />
        <h1 className="mt-3 text-lg font-semibold">Post not found</h1>
        <p className="mt-1 text-sm text-zinc-500">It may have been deleted.</p>
        <Link href="/admin/posts" className={buttonClasses("secondary", "sm", "mt-5")}>
          Back to posts
        </Link>
      </div>
    );
  }

  if (!post) {
    return <div className="h-96 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800/60" role="status" aria-label="Loading post" />;
  }

  // Keyed by id so navigating between posts resets the editor state.
  return <PostEditor key={post.id} post={post} />;
}
