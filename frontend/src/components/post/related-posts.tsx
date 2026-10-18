import { PostCard } from "@/components/site/post-card";
import type { PostSummary } from "@/lib/types";

export function RelatedPosts({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="space-y-6">
      <h2 id="related-heading" className="font-mono text-xs tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
        Keep reading
      </h2>
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
