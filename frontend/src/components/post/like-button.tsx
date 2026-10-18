"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

import { engagement } from "@/lib/browser-api";
import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";
import type { LikeState } from "@/lib/types";

interface LikeButtonProps {
  slug: string;
  initialCount: number;
}

export function LikeButton({ slug, initialCount }: LikeButtonProps) {
  const [state, setState] = useState<LikeState>({ liked: false, like_count: initialCount });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    engagement
      .getLike(slug)
      .then((current) => {
        if (!cancelled) setState(current);
      })
      .catch(() => {
        // Keep the server-rendered count.
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function toggle() {
    if (pending) return;
    const previous = state;
    const liked = !previous.liked;
    setState({ liked, like_count: Math.max(0, previous.like_count + (liked ? 1 : -1)) });
    setPending(true);
    try {
      setState(liked ? await engagement.like(slug) : await engagement.unlike(slug));
    } catch {
      setState(previous);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={state.liked}
      aria-label={state.liked ? "Unlike this post" : "Like this post"}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
        state.liked
          ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300"
          : "border-zinc-200 text-zinc-600 hover:border-rose-300 hover:text-rose-600 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-rose-500/40 dark:hover:text-rose-300",
      )}
    >
      <Heart className={cn("size-4 transition-transform", state.liked && "scale-110 fill-current")} aria-hidden />
      <span className="font-mono text-xs">{formatCount(state.like_count)}</span>
    </button>
  );
}
