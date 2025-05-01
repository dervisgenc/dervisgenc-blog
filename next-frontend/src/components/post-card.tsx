import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Star } from "lucide-react" // Added Star icon
import { PostListItem } from "@/types"
import { formatDistanceToNow } from "date-fns"
import ImageWithFallback from "./image-with-fallback"
import { cn } from "@/lib/utils" // Import cn utility

interface PostCardProps {
  post: PostListItem
  isFeatured?: boolean // Add isFeatured prop
}

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string: string) => {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function PostCard({ post, isFeatured = false }: PostCardProps) { // Destructure isFeatured
  // Get the relative time string and capitalize it
  const relativeDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  const formattedDate = capitalizeFirstLetter(relativeDate);
  const capitalizedCategory = post.category ? capitalizeFirstLetter(post.category) : null; // Capitalize category

  return (
    <Card className={cn(
      "flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-cyan-900/40 group",
      isFeatured && "border-cyan-500/50 dark:border-cyan-600/60 featured-post-card" // Conditional class
    )}>
      <Link href={`/post/${post.id}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {/* Optional: Add a Featured badge overlay */}
          {isFeatured && (
            <Badge variant="default" className="absolute top-2 right-2 z-10 bg-cyan-500 text-primary-foreground text-xs">
              <Star className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          )}
          <ImageWithFallback
            src={post.image_url || "/placeholder.svg"}
            fallbackSrc="/placeholder.svg" // Explicitly pass fallback if needed
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105" // Use group-hover
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          // onError is handled internally by ImageWithFallback
          />
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col p-4">
        {/* Category Badge */}
        {capitalizedCategory && ( // Use capitalized category
          <div className="mb-2">
            {/* Use capitalizeFirstLetter helper */}
            <Badge variant="outline" className="border-cyan-500 text-cyan-500 text-xs">
              {capitalizedCategory}
            </Badge>
          </div>
        )}
        {/* Apply conditional text size for title */}
        <h3 className={cn(
          "mb-2 line-clamp-2 font-semibold leading-tight",
          isFeatured ? "text-lg" : "text-base" // Larger text if featured
        )}>
          <Link href={`/post/${post.id}`} className="hover:text-cyan-500">
            {post.title}
          </Link>
        </h3>
        {/* Apply conditional text size for summary */}
        <p className={cn(
          "mb-3 line-clamp-3 flex-1 text-muted-foreground",
          isFeatured ? "text-sm" : "text-xs" // Larger text if featured
        )}>{post.summary}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{post.read_time} min read</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
