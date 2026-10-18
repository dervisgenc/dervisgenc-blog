import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { PostSummary } from "@/lib/types";

import { CoverImage } from "./cover-image";
import { PostMeta } from "./post-meta";

export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <article className="group relative grid items-center gap-6 md:grid-cols-[1.15fr_1fr] md:gap-10">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <CoverImage
          src={post.cover_image_url}
          alt=""
          priority
          className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="space-y-4">
        <p className="font-mono text-xs tracking-wider text-teal-700 uppercase dark:text-teal-400">Latest post</p>
        <h2 className="text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
          <Link
            href={`/posts/${post.slug}`}
            className="after:absolute after:inset-0 group-hover:text-teal-700 dark:group-hover:text-teal-300"
          >
            {post.title}
          </Link>
        </h2>
        {post.summary && <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">{post.summary}</p>}
        <PostMeta post={post} />
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Read post
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </article>
  );
}
