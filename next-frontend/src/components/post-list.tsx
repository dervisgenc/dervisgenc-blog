"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import Pagination from "@/components/pagination"

// Mock data for posts
const allPosts = [
  {
    id: "2",
    title: "The Rise of Quantum Computing and Its Impact on Encryption",
    excerpt:
      "Quantum computing threatens to break current encryption standards. Discover what this means for the future of data security.",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "18 Apr 2025",
    readTime: "7 min read",
    category: "Cryptography",
  },
  {
    id: "3",
    title: "Building Secure APIs: Best Practices for Developers",
    excerpt: "Learn how to design and implement secure APIs that protect your data and resist common attack vectors.",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "15 Apr 2025",
    readTime: "6 min read",
    category: "Programming",
  },
  {
    id: "4",
    title: "The Dark Side of AI: Ethical Concerns in Machine Learning",
    excerpt:
      "As AI becomes more powerful, ethical questions arise. Explore the potential risks and how to address them.",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "10 Apr 2025",
    readTime: "8 min read",
    category: "AI",
  },
  {
    id: "5",
    title: "Network Security in the Age of Remote Work",
    excerpt: "Remote work has changed the security landscape. Discover new approaches to keeping your network secure.",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "05 Apr 2025",
    readTime: "4 min read",
    category: "Networking",
  },
  {
    id: "6",
    title: "Ethical Hacking: Tools and Techniques for Security Professionals",
    excerpt:
      "Learn about the essential tools and methodologies used by ethical hackers to identify and address security vulnerabilities.",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "20 Apr 2025",
    readTime: "6 min read",
    category: "Cybersecurity",
  },
  {
    id: "7",
    title: "Securing Your Digital Life: A Comprehensive Guide",
    excerpt:
      "From password managers to VPNs, discover the essential tools and practices to protect your digital presence.",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "15 Apr 2025",
    readTime: "8 min read",
    category: "Privacy",
  },
  {
    id: "8",
    title: "The Future of Blockchain Technology",
    excerpt:
      "Blockchain is evolving beyond cryptocurrencies. Explore the innovative applications that are transforming industries.",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "12 Apr 2025",
    readTime: "5 min read",
    category: "Blockchain",
  },
  {
    id: "9",
    title: "Understanding Cross-Site Scripting (XSS) Attacks",
    excerpt:
      "XSS attacks remain one of the most common web vulnerabilities. Learn how they work and how to prevent them.",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "08 Apr 2025",
    readTime: "6 min read",
    category: "Web Security",
  },
  {
    id: "10",
    title: "The Psychology of Social Engineering",
    excerpt:
      "Social engineering exploits human psychology rather than technical vulnerabilities. Understand the tactics used by attackers.",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "03 Apr 2025",
    readTime: "7 min read",
    category: "Security",
  },
  {
    id: "11",
    title: "Cloud Security Best Practices",
    excerpt:
      "As more organizations move to the cloud, security concerns evolve. Learn how to secure your cloud infrastructure.",
    coverImage: "/placeholder.svg?height=400&width=600",
    date: "01 Apr 2025",
    readTime: "9 min read",
    category: "Cloud",
  },
]

interface PostListProps {
  postsPerPage?: number
}

export default function PostList({ postsPerPage = 6 }: PostListProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate total pages
  const totalPosts = allPosts.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = allPosts.slice(indexOfFirstPost, indexOfLastPost)

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={post.coverImage || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{post.date}</span>
              </div>
              <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight">
                <Link href={`/post/${post.id}`} className="hover:text-cyan-400">
                  {post.title}
                </Link>
              </h3>
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{post.readTime}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show pagination only if there are more than one page */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}
