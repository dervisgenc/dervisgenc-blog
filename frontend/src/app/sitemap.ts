import type { MetadataRoute } from "next";

import { listAllPosts } from "@/lib/api";
import { siteUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const posts = await listAllPosts().catch(() => []);
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...posts.map((post) => ({
      url: `${base}/posts/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
