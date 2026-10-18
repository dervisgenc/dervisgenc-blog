import Link from "next/link";

import type { PostSummary } from "@/lib/types";

import { CoverImage } from "./cover-image";
import { PostMeta } from "./post-meta";

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative flex flex-col">
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <CoverImage
          src={post.cover_image_url}
          alt=""
          className="aspect-[16/9] w-full transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-2">
        <PostMeta post={post} />
        <h3 className="text-lg leading-snug font-semibold tracking-tight">
          <Link
            href={`/posts/${post.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover:text-teal-700 dark:group-hover:text-teal-300"
          >
            {post.title}
          </Link>
        </h3>
        {post.summary && <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{post.summary}</p>}
        {post.tags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-x-2 pt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {post.tags.slice(0, 4).map((tag) => (
              <li key={tag}>#{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
