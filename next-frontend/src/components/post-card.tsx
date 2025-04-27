import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, ThumbsUp } from "lucide-react"
import { PostListItem } from "@/types"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: PostListItem
}

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string: string) => {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function PostCard({ post }: PostCardProps) {
  // Get the relative time string
  const relativeDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  // Capitalize the first letter
  const formattedDate = capitalizeFirstLetter(relativeDate);

  return (
    <Link href={`/post/${post.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={post.image_url || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* <Badge className="mb-2 bg-cyan-600 hover:bg-cyan-700">Category</Badge> */}
          <CardTitle className="mb-2 line-clamp-2 text-lg font-semibold leading-tight group-hover:text-cyan-600">
            {post.title}
          </CardTitle>
          <p className="line-clamp-3 text-sm text-muted-foreground">{post.summary}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 pt-0 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{post.read_time} min read</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            <span>{post.like_count}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
