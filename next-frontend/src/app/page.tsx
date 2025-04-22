import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "lucide-react"
import PostList from "@/components/post-list"

// Mock data for featured post
const featuredPost = {
  id: "1",
  title: "Understanding Zero-Day Exploits: The Silent Threats",
  excerpt:
    "Zero-day vulnerabilities represent one of the most dangerous threats in cybersecurity. Learn how they work and how to protect yourself.",
  coverImage: "/placeholder.svg?height=600&width=1200",
  date: "22 Apr 2025",
  readTime: "5 min read",
  category: "Cybersecurity",
}

export default function Home() {
  return (
    <div className="container py-6">
      {/* Featured Post */}
      <section className="mb-12">
        <Card className="overflow-hidden border-none bg-transparent">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative aspect-video overflow-hidden rounded-lg md:aspect-auto md:h-full">
              <Image
                src={featuredPost.coverImage || "/placeholder.svg"}
                alt={featuredPost.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <Badge className="mb-2 w-fit bg-cyan-600 hover:bg-cyan-700">{featuredPost.category}</Badge>
              <h1 className="mb-2 text-2xl font-bold leading-tight tracking-tight md:text-3xl lg:text-4xl">
                {featuredPost.title}
              </h1>
              <p className="mb-4 text-muted-foreground">{featuredPost.excerpt}</p>
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{featuredPost.readTime}</span>
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

      {/* Latest Posts */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Latest Posts</h2>
        </div>
        <PostList />
      </section>
    </div>
  )
}
