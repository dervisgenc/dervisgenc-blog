// Centralized Post interface matching backend structure
export interface Post {
  id: number;
  title: string;
  summary: string;
  content: string; // Included for detail views
  image_url: string | null; // Use snake_case from API response
  read_time: number;      // Use snake_case from API response
  like_count: number;     // Use snake_case from API response
  is_active: boolean;     // Use snake_case from API response
  created_at: string;     // Use snake_case from API response
  updated_at: string;     // Use snake_case from API response
  category?: string;      // Optional fields - Made optional for flexibility
  tags?: string;          // Optional fields (consider if this should be string[] later) - Made optional
  // Add other fields if necessary, like view_count, share_count etc.
}


// Refined PostListItem based on the main Post type
export interface PostListItem {
  id: number;
  title: string;
  summary: string; // Changed from description
  image_url: string;
  created_at: string; // Keep as string for simplicity, parse when needed
  read_time: number;
  is_active: boolean;
  like_count: number; // Add like count
  category?: string;  // Added Category (optional)
  tags?: string;      // Added Tags (optional)
}

export interface PostDetail extends PostListItem {
  content: string;
  updated_at: string; // Add updated_at for detail view
  // Category and tags are inherited from PostListItem
  // Add any other detailed fields if necessary
}


// Paginated response using the refined PostListItem
export interface PaginatedPostResponse {
  posts: PostListItem[];
  total_posts: number; // Renamed from total_count to match backend DTO
  total_pages: number;
  current_page: number;
  page_size: number;
}

export interface ErrorResponse {
  error: string;
}

// Add this interface for the like status API response
export interface LikeStatusResponse {
  has_liked: boolean;
  likes: number;
}

// Interface for the image upload response from the backend
export interface ImageUploadResponse {
  url: string;
  filename: string;
}

// For the admin dashboard cards
export interface OverallStatsResponse {
  total_posts: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  // Add other fields if backend provides them
}

// For the detailed post stats table in the admin dashboard
export interface PostDetailedStats {
  post_id: number;
  title: string;
  views: number;
  likes: number;
  shares: number;
  created_at: string; // Keep as string
}

export interface DetailedStatsResponse {
  total_stats: {
    total_views: number;
    total_likes: number;
    total_shares: number;
  };
  post_stats: PostDetailedStats[];
}

// For the traffic chart
export interface DailyTrafficStat {
  date: string; // YYYY-MM-DD
  views: number;
  unique_visitors: number;
}
