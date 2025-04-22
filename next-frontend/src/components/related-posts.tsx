import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

// Mock data for related posts
const relatedPosts = [
  {
    id: "2",
    title: "The Rise of Quantum Computing and Its Impact on Encryption",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "18 Apr 2025",
    readTime: "7 min read",
    category: "Cryptography",
  },
  {
    id: "6",
    title: "Ethical Hacking: Tools and Techniques for Security Professionals",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "20 Apr 2025",
    readTime: "6 min read",
    category: "Cybersecurity",
  },
  {
    id: "7",
    title: "Securing Your Digital Life: A Comprehensive Guide",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "15 Apr 2025",
    readTime: "8 min read",
    category: "Privacy",
  },
]

interface RelatedPostsProps {
  currentPostId: string
}

export default function RelatedPosts({ currentPostId }: RelatedPostsProps) {
  // In a real app, you would filter posts related to the current one
  // For now, we'll just use our mock data

  return (
    <div className="mb-6">
      <h3 className="mb-4 text-xl font-bold">Related Articles</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {relatedPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={post.coverImage || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <CardContent className="p-3">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
              </div>
              <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight">
                <Link href={`/post/${post.id}`} className="hover:text-cyan-400">
                  {post.title}
                </Link>
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{post.readTime}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
