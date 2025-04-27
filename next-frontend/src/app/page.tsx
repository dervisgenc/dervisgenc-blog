import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Clock, Calendar } from "lucide-react"
import PostList from "@/components/post-list"
import { PostListItem, PaginatedPostResponse } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { Separator } from "@/components/ui/separator"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"

async function getFeaturedPost(): Promise<PostListItem | null> {
  try {
    // Fetch the very first post (most recent)
    const response = await fetch(`${API_URL}/posts/paginated?page=1&size=1`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: PaginatedPostResponse = await response.json()
    return data.posts.length > 0 ? data.posts[0] : null
  } catch (error) {
    console.error("Failed to fetch featured post:", error)
    return null // Return null on error
  }
}

export default async function Home() {
  const featuredPost = await getFeaturedPost()

  return (
    <div className="container py-6">
      {/* Featured Post */}
      {featuredPost && (
        <section className="mb-6">
          <div className="grid gap-4 md:grid-cols-5 md:gap-6">
            {/* Image container spans 2 columns */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg md:col-span-2">
              <Image
                src={featuredPost.image_url || "/placeholder.svg"}
                alt={featuredPost.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            {/* Text content spans 3 columns */}
            <div className="flex flex-col justify-center md:col-span-3">
              <h1 className="mb-1 text-lg font-semibold leading-tight tracking-tight md:text-xl lg:text-xl">
                {featuredPost.title}
              </h1>
              <p className="mb-2 line-clamp-2 text-xs text-muted-foreground md:line-clamp-3 md:text-sm">{featuredPost.summary}</p>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(featuredPost.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{featuredPost.read_time} min read</span>
                </div>
              </div>
              <Button asChild size="sm" className="mt-1 w-fit bg-cyan-600 hover:bg-cyan-700">
                <Link href={`/post/${featuredPost.id}`}>Read Article</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Separator */}
      {featuredPost && <Separator className="my-8" />}

      {/* Latest Posts */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold md:text-2xl">Latest Posts</h2>
        </div>
        <PostList />
      </section>
    </div>
  )
}
