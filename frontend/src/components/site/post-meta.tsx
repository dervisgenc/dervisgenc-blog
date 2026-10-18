import { formatCount, formatDate } from "@/lib/format";
import type { PostSummary } from "@/lib/types";

interface PostMetaProps {
  post: PostSummary;
  showViews?: boolean;
}

/** Date, reading time and optionally views, in the monospace metadata style. */
export function PostMeta({ post, showViews = false }: PostMetaProps) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
      {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
      <span aria-hidden>·</span>
      <span>{post.reading_minutes} min read</span>
      {showViews && (
        <>
          <span aria-hidden>·</span>
          <span>{formatCount(post.view_count)} views</span>
        </>
      )}
    </p>
  );
}
