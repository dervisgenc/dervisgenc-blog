"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toast } from "@/components/hooks/use-toast"

interface PostLikeButtonProps {
  postId: string
  initialLikes: number
}

export default function PostLikeButton({ postId, initialLikes }: PostLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call to /api/posts/:id/like
      // const response = await fetch(`/api/posts/${postId}/like`, {
      //   method: 'POST',
      // });
      // if (!response.ok) throw new Error('Failed to like post');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      if (liked) {
        setLikes((prev) => prev - 1)
        setLiked(false)
        toast({
          title: "Post unliked",
          description: "You have removed your like from this post",
        })
      } else {
        setLikes((prev) => prev + 1)
        setLiked(true)
        toast({
          title: "Post liked",
          description: "You have liked this post",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={handleLike} disabled={isLoading}>
      <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
      <span>{likes} Likes</span>
    </Button>
  )
}
