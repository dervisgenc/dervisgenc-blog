"use client"

import { useState, useEffect } from "react"
import PostCard from "@/components/post-card"
import Pagination from "@/components/pagination" // Assuming you have this component
import { PostListItem, PaginatedPostResponse, ErrorResponse } from "@/types" // Import ErrorResponse
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
const POSTS_PER_PAGE = 9 // Match the search page size

// Define props interface
interface PostListProps {
  initialPosts?: PostListItem[];
  initialTotalPages?: number;
  currentPage?: number;
  onPageChange?: (newPage: number) => void;
  searchQuery?: string; // Add searchQuery prop
}

export default function PostList({
  initialPosts,
  initialTotalPages,
  currentPage: initialCurrentPage = 1, // Default to 1 if not provided
  onPageChange,
  searchQuery, // Receive searchQuery
}: PostListProps) {
  // Initialize state with props if available, otherwise use defaults/empty
  const [posts, setPosts] = useState<PostListItem[]>(initialPosts || [])
  const [currentPage, setCurrentPage] = useState(initialCurrentPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1)
  // Loading is true only if we need to fetch data internally
  const [loading, setLoading] = useState(!initialPosts)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If initialPosts are provided, update state when they change (e.g., search results update)
    if (initialPosts) {
      setPosts(initialPosts)
      setTotalPages(initialTotalPages || 1)
      setCurrentPage(initialCurrentPage)
      setLoading(false) // Data is provided, not loading internally
      setError(null) // Clear previous errors
    }
  }, [initialPosts, initialTotalPages, initialCurrentPage])


  useEffect(() => {
    // Fetch posts only if initialPosts were NOT provided
    // Or if we are handling pagination internally based on searchQuery
    const fetchPosts = async (page: number) => {
      setLoading(true)
      setError(null)
      let url = `${API_URL}/posts/paginated?page=${page}&size=${POSTS_PER_PAGE}`
      // If searchQuery is provided, use the search endpoint instead
      if (searchQuery) {
        url = `${API_URL}/posts/search?q=${encodeURIComponent(searchQuery)}&page=${page}&size=${POSTS_PER_PAGE}`
      }

      try {
        const response = await fetch(url)
        if (!response.ok) {
          const errorData: ErrorResponse = await response.json(); // Use ErrorResponse type
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
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

    // Only fetch if initialPosts were not provided OR if searchQuery is present (meaning we might need to fetch subsequent pages for search)
    if (!initialPosts || searchQuery) {
      // If searchQuery is present, we rely on the parent (search page) to pass the initial data
      // and trigger re-renders via prop changes.
      // If initialPosts are NOT present (e.g., on the home page), fetch normally.
      if (!initialPosts) {
        fetchPosts(currentPage)
      }
    }

  }, [currentPage, initialPosts, searchQuery]) // Depend on currentPage, initialPosts, and searchQuery

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      // If onPageChange prop is provided (like from search page), use it
      if (onPageChange) {
        onPageChange(page)
      } else {
        // Otherwise, handle pagination internally (like on home page)
        setCurrentPage(page)
        // Optional: Scroll to top when changing page
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  // Use initialCurrentPage for the isFeatured logic if initialPosts are provided
  const pageForFeaturedCheck = initialPosts ? initialCurrentPage : currentPage;

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

  if (posts.length === 0 && !loading && !error) { // Added checks for loading/error
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">No Posts Found</p>
        <p className="text-muted-foreground">
          {searchQuery
            ? "No posts found matching your search query."
            : "There are currently no posts to display."}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            // Use the correct page number for determining featured status
            isFeatured={pageForFeaturedCheck === 1 && index === 0 && !searchQuery} // Only feature on home page (no search query)
          />
        ))}
      </div>
      {/* Use the potentially updated totalPages from state */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          {/* Use the potentially updated currentPage from state */}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}
