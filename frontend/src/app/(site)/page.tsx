import { CloudOff, PenLine, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FeaturedPost } from "@/components/site/featured-post";
import { Notice } from "@/components/site/notice";
import { Pagination } from "@/components/site/pagination";
import { PostCard } from "@/components/site/post-card";
import { TagLink } from "@/components/site/tag-link";
import { listPosts, listTags } from "@/lib/api";
import { site } from "@/lib/config";
import { plural } from "@/lib/format";
import type { Page, PostSummary, TagCount } from "@/lib/types";

const PAGE_SIZE = 9;

interface HomeSearchParams {
  page?: string | string[];
  q?: string | string[];
  tag?: string | string[];
}

function single(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<HomeSearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const q = single(params.q);
  const tag = single(params.tag);
  if (q) return { title: `Search: ${q}`, robots: { index: false } };
  if (tag) return { title: `#${tag}`, alternates: { canonical: `/?tag=${encodeURIComponent(tag)}` } };
  return {};
}

export default async function HomePage({ searchParams }: { searchParams: Promise<HomeSearchParams> }) {
  const params = await searchParams;
  const q = single(params.q);
  const tag = single(params.tag);
  const page = Math.max(1, Number.parseInt(single(params.page), 10) || 1);
  const filtered = Boolean(q || tag);

  let posts: Page<PostSummary>;
  let tags: TagCount[];
  try {
    [posts, tags] = await Promise.all([listPosts({ page, pageSize: PAGE_SIZE, q, tag }), listTags()]);
  } catch {
    return (
      <Notice icon={CloudOff} title="The blog is taking a short break">
        Posts could not be loaded right now. Please try again in a minute.
      </Notice>
    );
  }

  const showFeatured = !filtered && page === 1 && posts.items.length > 0;
  const [featured, ...rest] = posts.items;
  const gridPosts = showFeatured ? rest : posts.items;

  const hrefFor = (target: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (tag) query.set("tag", tag);
    if (target > 1) query.set("page", String(target));
    const text = query.toString();
    return text ? `/?${text}` : "/";
  };

  return (
    <div className="space-y-14">
      {!filtered && page === 1 && (
        <section className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{site.description}</h1>
        </section>
      )}

      {filtered && (
        <section className="space-y-2">
          <p className="font-mono text-xs tracking-wider text-teal-700 uppercase dark:text-teal-400">
            {q ? "Search" : "Tag"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{q ? `“${q}”` : `#${tag}`}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {plural(posts.total, "post")} found ·{" "}
            <Link href="/" className="text-teal-700 underline-offset-4 hover:underline dark:text-teal-300">
              clear filter
            </Link>
          </p>
        </section>
      )}

      {tags.length > 0 && (
        <nav aria-label="Tags" className="flex flex-wrap gap-2">
          {tags.map((item) => (
            <TagLink key={item.name} tag={item.name} count={item.count} active={item.name === tag} />
          ))}
        </nav>
      )}

      {posts.items.length === 0 ? (
        filtered ? (
          <Notice icon={SearchX} title="Nothing matches that yet">
            Try another search term or browse all posts.
          </Notice>
        ) : (
          <Notice icon={PenLine} title="The first post is on its way">
            This is a fresh start. New writing about Linux, networking, Go and security will appear here soon —
            subscribe to the{" "}
            <a href="/rss.xml" className="text-teal-700 underline-offset-4 hover:underline dark:text-teal-300">
              RSS feed
            </a>{" "}
            to catch it.
          </Notice>
        )
      ) : (
        <>
          {showFeatured && featured && <FeaturedPost post={featured} />}

          {gridPosts.length > 0 && (
            <section aria-labelledby="posts-heading" className="space-y-6">
              <h2 id="posts-heading" className="font-mono text-xs tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                {showFeatured ? "More posts" : "Posts"}
              </h2>
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          <Pagination page={posts.page} totalPages={posts.total_pages} hrefFor={hrefFor} />
        </>
      )}
    </div>
  );
}
