import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock } from "lucide-react"
import PostLikeButton from "@/components/post-like-button"
import PostShareButton from "@/components/post-share-button"
import RelatedPosts from "@/components/related-posts"
import { CalendarIcon, ArrowLeftIcon } from "@radix-ui/react-icons"
import { PostDetail, ErrorResponse, PaginatedPostResponse, PostListItem } from "@/types"
import { formatDistanceToNow } from "date-fns"

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

  const post = await getPost(postId);

  if (!post) {
    notFound()
  }

  // Get the relative time string and capitalize it
  const relativeDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  const formattedDate = capitalizeFirstLetter(relativeDate);

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-1 text-muted-foreground">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <article className="mx-auto max-w-3xl">
        <div className="mb-6 space-y-4">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">{post.title}</h1>

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

        <div className="relative mb-6 aspect-video overflow-hidden rounded-lg">
          <Image src={post.image_url || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
        </div>

        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mb-6 flex items-center justify-between border-y border-border py-4">
          <PostLikeButton postId={post.id} initialLikes={post.like_count} />
          <PostShareButton postId={post.id} title={post.title} />
        </div>

        <Separator className="my-6" />

        <RelatedPosts currentPostId={post.id} />
      </article>
    </div>
  )
}
