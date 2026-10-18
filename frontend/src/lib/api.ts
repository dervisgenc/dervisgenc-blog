import "server-only";

import { apiInternalUrl } from "./config";
import type { Page, Post, PostSummary, TagCount } from "./types";

// Server-side client for the public API. Pages are rendered per request, so
// nothing is cached here.

export class BackendError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

async function get<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiInternalUrl() + path, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
  } catch (cause) {
    throw new BackendError(`backend unreachable: ${String(cause)}`);
  }
  if (!response.ok) {
    throw new BackendError(`GET ${path} failed with ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}

export interface PostQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  tag?: string;
}

export function listPosts({ page = 1, pageSize = 9, q, tag }: PostQuery = {}): Promise<Page<PostSummary>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  return get(`/api/posts?${params}`);
}

/** Returns the published post, or null when it does not exist. */
export async function getPost(slug: string): Promise<Post | null> {
  try {
    return await get<Post>(`/api/posts/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof BackendError && error.status === 404) return null;
    throw error;
  }
}

export function getRelatedPosts(slug: string, limit = 3): Promise<PostSummary[]> {
  return get(`/api/posts/${encodeURIComponent(slug)}/related?limit=${limit}`);
}

export function listTags(): Promise<TagCount[]> {
  return get("/api/tags");
}

/** Fetches every published post, page by page, for feeds and the sitemap. */
export async function listAllPosts(maxPages = 20): Promise<PostSummary[]> {
  const posts: PostSummary[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const result = await listPosts({ page, pageSize: 50 });
    posts.push(...result.items);
    if (page >= result.total_pages) break;
  }
  return posts;
}
