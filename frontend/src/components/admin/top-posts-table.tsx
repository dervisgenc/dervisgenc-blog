import Link from "next/link";

import { formatCount } from "@/lib/format";
import type { TopPost } from "@/lib/types";

export function TopPostsTable({ posts }: { posts: TopPost[] }) {
  if (posts.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No views in this period yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400">
            <th scope="col" className="px-5 py-2.5 font-medium">Post</th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">Views</th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">Likes</th>
            <th scope="col" className="px-5 py-2.5 text-right font-medium">Shares</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {posts.map((post) => (
            <tr key={post.id}>
              <td className="max-w-0 px-5 py-2.5">
                <Link href={`/admin/posts/${post.id}`} className="block truncate hover:text-teal-700 dark:hover:text-teal-300">
                  {post.title}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-right font-mono tabular-nums">{formatCount(post.views)}</td>
              <td className="px-3 py-2.5 text-right font-mono tabular-nums">{formatCount(post.likes)}</td>
              <td className="px-5 py-2.5 text-right font-mono tabular-nums">{formatCount(post.shares)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
