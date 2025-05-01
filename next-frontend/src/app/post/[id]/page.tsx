import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, Tag } from "lucide-react" // Import Tag icon
import PostLikeButton from "@/components/post-like-button"
import PostShareButton from "@/components/post-share-button"
import RelatedPosts from "@/components/related-posts"
import { CalendarIcon, ArrowLeftIcon } from "@radix-ui/react-icons"
import { PostDetail, ErrorResponse, PaginatedPostResponse, PostListItem, LikeStatusResponse } from "@/types" // Add LikeStatusResponse
import { formatDistanceToNow } from "date-fns"
import { headers } from "next/headers" // Import headers
import { Badge } from "@/components/ui/badge" // Import Badge

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string: string) => {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Fetch post data from the backend API
async function getPost(id: string): Promise<PostDetail | null> {
  try {
    // Convert string ID to number for API call
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return null;
    }

    const response = await fetch(`${API_URL}/posts/${numericId}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      console.error(`API Error: ${response.status} ${response.statusText}`)
      return null
    }

    const data: PostDetail = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch post:", error)
    return null
  }
}

// Fetch initial like status
async function getLikeStatus(id: string): Promise<LikeStatusResponse | null> {
  try {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    // Get client IP from headers - IMPORTANT for server components
    const forwarded = (await headers()).get("x-forwarded-for")
    const realIp = (await headers()).get("x-real-ip")
    const clientIp = forwarded ? forwarded.split(/, /)[0] : realIp

    const response = await fetch(`${API_URL}/posts/${numericId}/like`, {
      method: 'GET',
      headers: {
        // Pass client IP if available, backend needs this
        ...(clientIp && { 'X-Forwarded-For': clientIp }),
        'Accept': 'application/json',
      },
      // Disable caching for like status as it's user-specific
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`API Error (Like Status): ${response.status} ${response.statusText}`)
      // Return default state if fetch fails (e.g., not liked, 0 likes)
      // Or handle specific errors like 404 if needed
      return { has_liked: false, likes: 0 }; // Default fallback
    }

    const data: LikeStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch like status:", error);
    return { has_liked: false, likes: 0 }; // Default fallback on exception
  }
}


// Function to generate static paths for Next.js
export async function generateStaticParams() {
  try {
    // Fetch posts for static generation
    const response = await fetch(`${API_URL}/posts/paginated?page=1&size=10`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Make sure we got valid data with posts array
    if (!data || !data.posts || !Array.isArray(data.posts)) {
      return [];
    }

    // Return array of objects with string id
    return data.posts.map((post: PostListItem) => ({
      id: String(post.id)
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Type for page props
type PageProps = {
  params: Promise<{ id: string }> | { id: string };
}

export default async function PostPage({ params }: PageProps) {
  // Await the params if it's a Promise
  const resolvedParams = 'then' in params ? await params : params;
  const postId = resolvedParams.id;

  // Fetch post and like status concurrently
  const [post, likeStatus] = await Promise.all([
    getPost(postId),
    getLikeStatus(postId) // Fetch like status
  ]);


  if (!post) {
    notFound()
  }

  // Use like count from likeStatus if available, otherwise fallback to post.like_count
  const initialLikes = likeStatus?.likes ?? post.like_count;
  // Use has_liked from likeStatus, default to false if fetch failed
  const initialLiked = likeStatus?.has_liked ?? false;


  // Get the relative time string and capitalize it
  const relativeDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  const formattedDate = capitalizeFirstLetter(relativeDate);
  const capitalizedCategory = post.category ? capitalizeFirstLetter(post.category) : null; // Capitalize category

  // Split tags string into an array, trim whitespace, and filter empty tags
  const tagsArray = post.tags ? post.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <article className="mx-auto max-w-3xl">
        <div className="mb-6 space-y-4">
          {/* Category Badge */}
          {capitalizedCategory && ( // Use capitalized category
            <div className="mb-2">
              <Badge variant="outline" className="border-cyan-500 text-cyan-500">
                {capitalizedCategory}
              </Badge>
            </div>
          )}
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">{post.title}</h1>

          {/* ... Meta Info (Date, Read Time) ... */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{post.read_time} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* ... Image ... */}
        <div className="relative mb-6 aspect-video overflow-hidden rounded-lg">
          <Image src={post.image_url || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
        </div>

        {/* ... Content ... */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags Section */}
        {tagsArray.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {tagsArray.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Like/Share Buttons */}
        <div className="mb-6 flex items-center justify-between border-y border-border py-4">
          {/* Pass initialLiked status */}
          <PostLikeButton
            postId={post.id}
            initialLikes={initialLikes}
            initialLiked={initialLiked}
          />
          <PostShareButton postId={post.id} title={post.title} />
        </div>

        {/* ... Separator and Related Posts ... */}
        <Separator className="my-6" />

        <RelatedPosts currentPostId={post.id} />
      </article>
    </div>
  )
}
