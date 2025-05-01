import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostListItem, ErrorResponse } from "@/types" // Assuming PostListItem is defined in types

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api";

// Fetch related posts from the backend API
async function getRelatedPosts(currentPostId: number): Promise<PostListItem[]> {
  try {
    const response = await fetch(`${API_URL}/posts/${currentPostId}/related?limit=3`, {
      next: { revalidate: 3600 }, // Cache for 1 hour, adjust as needed
    });

    if (!response.ok) {
      // Log error but return empty array to prevent breaking the page
      console.error(`API Error fetching related posts: ${response.status} ${response.statusText}`);
      try {
        const errorData: ErrorResponse = await response.json();
        console.error("Error details:", errorData.error);
      } catch (jsonError) {
        console.error("Could not parse error response JSON");
      }
      return [];
    }

    const data: PostListItem[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch related posts:", error);
    return []; // Return empty array on network or other errors
  }
}

interface RelatedPostsProps {
  currentPostId: number // Changed from string to number
}

export default async function RelatedPosts({ currentPostId }: RelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(currentPostId)

  if (!relatedPosts || relatedPosts.length === 0) {
    return null // Don't render anything if no related posts or fetch failed
  }

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Related Posts</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`} className="group block">
            <Card className="h-full overflow-hidden transition-shadow duration-300 ease-in-out group-hover:shadow-md">
              <CardHeader className="p-0">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={post.image_url || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <CardTitle className="mb-1 line-clamp-2 text-base font-semibold leading-tight group-hover:text-cyan-600">
                  {post.title}
                </CardTitle>
                {/* Optionally add summary or date here */}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
