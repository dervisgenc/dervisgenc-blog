"use client"

import { useState, useEffect } from "react"
import PostCard from "@/components/post-card"
import Pagination from "@/components/pagination" // Assuming you have this component
import { PostListItem, PaginatedPostResponse } from "@/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
const POSTS_PER_PAGE = 6

export default function PostList() {
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async (page: number) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_URL}/posts/paginated?page=${page}&size=${POSTS_PER_PAGE}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: PaginatedPostResponse = await response.json()
        setPosts(data.posts)
        setTotalPages(data.total_pages)
        setCurrentPage(data.current_page)
      } catch (err) {
        console.error("Failed to fetch posts:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setPosts([]) // Clear posts on error
        setTotalPages(1) // Reset pagination
        setCurrentPage(1)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts(currentPage)
  }, [currentPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Optional: Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading posts...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Fetching Posts</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">No Posts Found</p>
        <p className="text-muted-foreground">There are currently no posts to display.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}
