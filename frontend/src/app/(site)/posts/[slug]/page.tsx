import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { LikeButton } from "@/components/post/like-button";
import { Markdown } from "@/components/post/markdown";
import { RelatedPosts } from "@/components/post/related-posts";
import { ShareButtons } from "@/components/post/share-buttons";
import { TableOfContents } from "@/components/post/table-of-contents";
import { ViewTracker } from "@/components/post/view-tracker";
import { CoverImage } from "@/components/site/cover-image";
import { PostMeta } from "@/components/site/post-meta";
import { TagLink } from "@/components/site/tag-link";
import { getPost, getRelatedPosts } from "@/lib/api";
import { absoluteUrl, site } from "@/lib/config";
import { extractHeadings } from "@/lib/markdown";
import type { Post, PostSummary } from "@/lib/types";

// generateMetadata and the page both need the post; cache() fetches it once
// per request.
const loadPost = cache(getPost);

type PostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Post not found" };

  const path = `/posts/${post.slug}`;
  const images = post.cover_image_url ? [{ url: absoluteUrl(post.cover_image_url), alt: post.title }] : undefined;
  return {
    title: post.title,
    description: post.summary || undefined,
    keywords: post.tags,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: post.title,
      description: post.summary || undefined,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [site.aboutUrl],
      tags: post.tags,
      images,
    },
    twitter: { card: images ? "summary_large_image" : "summary", title: post.title, description: post.summary || undefined, images },
  };
}

function articleJsonLd(post: Post): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary || undefined,
    image: post.cover_image_url ? [absoluteUrl(post.cover_image_url)] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    keywords: post.tags.join(", ") || undefined,
    mainEntityOfPage: absoluteUrl(`/posts/${post.slug}`),
    author: { "@type": "Person", name: site.author, url: site.aboutUrl },
  };
  // Escape "<" so post content can never close the script element.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const related: PostSummary[] = await getRelatedPosts(post.slug).catch(() => []);
  const headings = extractHeadings(post.content);
  const showToc = headings.length >= 3;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd(post) }} />
      <ViewTracker slug={post.slug} />

      <div className={showToc ? "grid gap-12 lg:grid-cols-[minmax(0,1fr)_13rem]" : undefined}>
        <article className="mx-auto w-full max-w-3xl space-y-10">
          <header className="space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="size-4" aria-hidden /> All posts
            </Link>
            <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">{post.title}</h1>
            {post.summary && <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{post.summary}</p>}
            <PostMeta post={post} showViews />
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <TagLink key={tag} tag={tag} />
                ))}
              </div>
            )}
          </header>

          {post.cover_image_url && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <CoverImage src={post.cover_image_url} alt={post.title} priority className="aspect-[2/1] w-full" />
            </div>
          )}

          <Markdown content={post.content} />

          <footer className="flex flex-col gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
            <LikeButton slug={post.slug} initialCount={post.like_count} />
            <ShareButtons slug={post.slug} title={post.title} />
          </footer>
        </article>

        {showToc && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 pt-1">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        )}
      </div>

      <div className="mt-20">
        <RelatedPosts posts={related} />
      </div>
    </>
  );
}
