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
  category?: string;      // Optional fields
  tags?: string;          // Optional fields (consider if this should be string[] later)
  // Add other fields if necessary, like view_count, share_count etc.
}


// Refined PostListItem based on the main Post type
export type PostListItem = Pick<
  Post,
  'id' | 'title' | 'summary' | 'image_url' | 'read_time' | 'like_count' | 'created_at' | 'is_active'
>;


// Paginated response using the refined PostListItem
export interface PaginatedPostResponse {
  posts: PostListItem[];
  total_posts: number;
  current_page: number; // Renamed from page for clarity
  page_size: number;
  total_pages: number;
}

// PostDetail can now just be an alias for Post if it includes all fields
export type PostDetail = Post;


export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
}

// Interface for the image upload response from the backend
export interface ImageUploadResponse {
  url: string;
  filename: string;
}
