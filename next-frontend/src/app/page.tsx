import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Clock, Calendar } from "lucide-react"
import PostList from "@/components/post-list"
import { PostListItem, PaginatedPostResponse } from "@/types"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string: string | undefined): string => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getFeaturedPost(): Promise<PostListItem | null> {
  try {
    // Fetch the very first post (most recent)
    const response = await fetch(`${API_URL}/posts/paginated?page=1&size=1`, {
      next: { revalidate: 60 }, // Revalidate every minute
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
        <section className="mb-12">
          {/* Card has border-none and bg-transparent */}
          <Card className="overflow-hidden border-none bg-transparent">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Image container */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg md:aspect-auto md:h-full">
                <Image
                  src={featuredPost.image_url || "/placeholder.svg"}
                  alt={featuredPost.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Text container: Add min-height for medium screens and up */}
              <div className="flex flex-col justify-center md:min-h-[280px]">
                {featuredPost.category && (
                  <Badge className="mb-2 w-fit bg-cyan-600 hover:bg-cyan-700">{capitalizeFirstLetter(featuredPost.category)}</Badge>
                )}
                <h1 className="mb-2 text-2xl font-bold leading-tight tracking-tight md:text-3xl lg:text-4xl">
                  {featuredPost.title}
                </h1>
                <p className="mb-4 text-muted-foreground">{featuredPost.summary}</p>
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(featuredPost.created_at), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{featuredPost.read_time} min read</span>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-fit bg-cyan-600 hover:bg-cyan-700">
                  <Link href={`/post/${featuredPost.id}`}>Read Article</Link>
                </Button>
              </div>
            </div>
          </Card>
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
