import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostListItem } from "@/types" // Assuming PostListItem is defined in types

// Mock data for related posts - Replace with API call
const mockRelatedPosts: PostListItem[] = [
  {
    id: 2,
    title: "The Rise of AI in Cybersecurity: Opportunities and Challenges",
    summary: "Exploring how artificial intelligence is transforming the cybersecurity landscape.",
    image_url: "/placeholder.svg?height=200&width=300",
    read_time: 6,
    like_count: 98,
    created_at: "2025-04-15T10:00:00Z",
  },
  {
    id: 3,
    title: "Securing Your Smart Home: A Comprehensive Guide",
    summary: "Practical tips and strategies to protect your connected home devices from cyber threats.",
    image_url: "/placeholder.svg?height=200&width=300",
    read_time: 7,
    like_count: 115,
    created_at: "2025-04-10T14:30:00Z",
  },
  {
    id: 4,
    title: "Understanding Phishing Attacks and How to Avoid Them",
    summary: "Learn to identify and protect yourself from common phishing scams.",
    image_url: "/placeholder.svg?height=200&width=300",
    read_time: 4,
    like_count: 76,
    created_at: "2025-04-05T09:15:00Z",
  },
]

// This would be replaced with a database query or API call in a real application
async function getRelatedPosts(currentPostId: number): Promise<PostListItem[]> {
  // Simulate fetching posts and filtering out the current one
  // In a real app, you might fetch based on tags, category, etc.
  return mockRelatedPosts.filter((post) => post.id !== currentPostId).slice(0, 3) // Limit to 3 related posts
}

interface RelatedPostsProps {
  currentPostId: number // Changed from string to number
}

export default async function RelatedPosts({ currentPostId }: RelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(currentPostId)

  if (!relatedPosts || relatedPosts.length === 0) {
    return null // Don't render anything if no related posts
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
