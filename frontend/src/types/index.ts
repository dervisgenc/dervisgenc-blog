// Base post interfaces
export interface BasePost {
    id: number;
    title: string;
    summary: string;
    image_url: string;
    read_time: number;
    like_count: number;
    created_at: string;
}

export interface PostListItem extends BasePost {
    // PostListResponse equivalent
}

export interface PostDetail extends BasePost {
    content: string;
    is_active: boolean;
}

export interface PaginatedResponse {
    posts: PostListItem[];
    total_posts: number;
    current_page: number;
    page_size: number;
    total_pages: number;
}

export interface PostCreateRequest {
    title: string;
    content: string;
    summary?: string;
    read_time?: number;
    is_active?: boolean;
}

export interface LikeResponse {
    has_liked: boolean;
    likes: number;
}

export interface PostStats extends BasePost {
    views: number;
    shares: number;
    monthly_stats: MonthlyStats[];
}

export interface MonthlyStats {
    month: string;
    views: number;
    likes: number;
    shares: number;
}

export interface DailyStat {
    date: string;
    total_visits: number;
    unique_visitors: number;
    total_post_views: number;
    total_likes: number;
    total_shares: number;
}

export interface StatsResponse {
    total_visits: number;
    unique_visitors: number;
    total_post_views: number;
    total_likes: number;
    total_shares: number;
    daily_stats: DailyStat[];
    popular_posts: PostStats[];
    visitors_by_hour: Record<number, number>;
    top_referrers: Record<string, number>;
    browser_stats: Record<string, number>;
}

export interface DetailedStatsResponse {
    total_stats: {
        total_views: number;
        total_likes: number;
        total_shares: number;
    };
    post_stats: PostDetailedStats[];
}

export interface PostDetailedStats {
    post_id: number;
    title: string;
    views: number;
    likes: number;
    shares: number;
    created_at: string;
}

export interface PostDetailedResponse {
    post_id: number;
    title: string;
    created_at: string;
    read_time: number;
    views: number;
    likes: number;
    shares: number;
    monthly_stats: MonthlyStats[];
}

export interface ErrorResponse {
    code: string;
    message: string;
    details?: string;
}
