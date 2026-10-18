// Types mirroring the backend API contract (docs/api.md).

export interface Page<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PostSummary {
  id: number;
  slug: string;
  title: string;
  summary: string;
  cover_image_url: string;
  tags: string[];
  reading_minutes: number;
  published_at: string | null;
  updated_at: string;
  view_count: number;
  like_count: number;
}

export interface Post extends PostSummary {
  content: string;
}

export type PostStatus = "draft" | "published";

export interface AdminPostSummary extends PostSummary {
  status: PostStatus;
  share_count: number;
  created_at: string;
}

export interface AdminPost extends AdminPostSummary {
  content: string;
}

export interface PostInput {
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url: string;
  tags: string[];
  status: PostStatus;
}

export interface TagCount {
  name: string;
  count: number;
}

export interface LikeState {
  liked: boolean;
  like_count: number;
}

export type ShareChannel = "x" | "linkedin" | "whatsapp" | "telegram" | "copy" | "native";

export interface Session {
  username: string;
  expires_at: string;
}

export interface Upload {
  url: string;
  width: number;
  height: number;
}

export interface StatsSummary {
  posts_published: number;
  posts_draft: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  views_today: number;
  visitors_today: number;
  views_30d: number;
  visitors_30d: number;
}

export interface DailyStat {
  day: string;
  views: number;
  visitors: number;
  likes: number;
  shares: number;
}

export interface PostDailyStat {
  day: string;
  views: number;
  likes: number;
  shares: number;
}

export interface TopPost {
  id: number;
  slug: string;
  title: string;
  views: number;
  likes: number;
  shares: number;
}

export interface ApiErrorBody {
  error: string;
}
