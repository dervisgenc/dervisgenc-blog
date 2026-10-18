import type {
  AdminPost,
  AdminPostSummary,
  ApiErrorBody,
  DailyStat,
  LikeState,
  Page,
  PostDailyStat,
  PostInput,
  PostStatus,
  Session,
  ShareChannel,
  StatsSummary,
  TopPost,
  Upload,
} from "./types";

// Browser-side client. Requests are same-origin; the admin session travels
// in an HttpOnly cookie the browser attaches automatically.

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers, credentials: "same-origin" });
  } catch {
    throw new ApiError("Network error, check your connection.", 0);
  }

  if (!response.ok) {
    throw new ApiError(await errorMessage(response), response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    if (body.error) return body.error;
  } catch {
    // Not a JSON body; fall through to the generic message.
  }
  return `Request failed (${response.status})`;
}

function json(body: unknown): string {
  return JSON.stringify(body);
}

function postPath(slug: string): string {
  return `/api/posts/${encodeURIComponent(slug)}`;
}

/** Public endpoints called from the reader's browser. */
export const engagement = {
  recordView: (slug: string) => request<void>(`${postPath(slug)}/views`, { method: "POST", keepalive: true }),
  getLike: (slug: string) => request<LikeState>(`${postPath(slug)}/like`),
  like: (slug: string) => request<LikeState>(`${postPath(slug)}/like`, { method: "PUT" }),
  unlike: (slug: string) => request<LikeState>(`${postPath(slug)}/like`, { method: "DELETE" }),
  recordShare: (slug: string, channel: ShareChannel) =>
    request<void>(`${postPath(slug)}/shares`, { method: "POST", body: json({ channel }), keepalive: true }),
};

export interface AdminPostQuery {
  status?: PostStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}

/** Admin endpoints; every call requires a session. */
export const admin = {
  login: (username: string, password: string) =>
    request<Session>("/api/admin/login", { method: "POST", body: json({ username, password }) }),
  logout: () => request<void>("/api/admin/logout", { method: "POST" }),
  session: () => request<Session>("/api/admin/session"),

  listPosts: ({ status, q, page = 1, pageSize = 20 }: AdminPostQuery = {}) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return request<Page<AdminPostSummary>>(`/api/admin/posts?${params}`);
  },
  getPost: (id: number) => request<AdminPost>(`/api/admin/posts/${id}`),
  createPost: (input: PostInput) => request<AdminPost>("/api/admin/posts", { method: "POST", body: json(input) }),
  updatePost: (id: number, input: PostInput) =>
    request<AdminPost>(`/api/admin/posts/${id}`, { method: "PUT", body: json(input) }),
  deletePost: (id: number) => request<void>(`/api/admin/posts/${id}`, { method: "DELETE" }),

  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Upload>("/api/admin/uploads", { method: "POST", body: form });
  },

  statsSummary: () => request<StatsSummary>("/api/admin/stats/summary"),
  dailyStats: (days: number) => request<DailyStat[]>(`/api/admin/stats/daily?days=${days}`),
  topPosts: (days: number, limit = 10) => request<TopPost[]>(`/api/admin/stats/top-posts?days=${days}&limit=${limit}`),
  postDailyStats: (id: number, days: number) =>
    request<PostDailyStat[]>(`/api/admin/stats/posts/${id}/daily?days=${days}`),
};
