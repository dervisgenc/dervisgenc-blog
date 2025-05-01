"use client"

import { useState, useEffect } from "react" // Import useEffect
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toast } from "@/components/hooks/use-toast"
import type { LikeStatusResponse } from "@/types" // Import the response type

interface PostLikeButtonProps {
  postId: number
  initialLikes: number
  initialLiked: boolean // Add initial liked status prop
}

export default function PostLikeButton({ postId, initialLikes, initialLiked }: PostLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(initialLiked) // Initialize with prop
  const [isLoading, setIsLoading] = useState(false)

  // Effect to read from local storage on mount
  useEffect(() => {
    const storageKey = `likeStatus-${postId}`;
    const storedLikeStatus = localStorage.getItem(storageKey);
    if (storedLikeStatus !== null) {
      // If a value exists in storage, use it, overriding the initial prop
      setLiked(storedLikeStatus === 'true');
    } else {
      // If no value in storage, rely on the initial prop from the server
      setLiked(initialLiked);
    }
    // Ensure likes count is also initialized correctly (it should be from props)
    setLikes(initialLikes);
  }, [postId, initialLiked, initialLikes]); // Rerun if postId changes or initial props change


  const handleLike = async () => {
    setIsLoading(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
    const storageKey = `likeStatus-${postId}`; // Define storage key

    try {
      const response = await fetch(`${apiUrl}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: No Authorization header needed for public like action usually
        },
      });

      const result: LikeStatusResponse | { error: string } = await response.json();

      if (!response.ok) {
        // Try to get error message from backend response
        const errorMessage = (result as { error: string }).error || `Failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      // Check if the result has the expected properties
      if ('has_liked' in result && 'likes' in result) {
        // Update state based on the API response
        setLiked(result.has_liked);
        setLikes(result.likes);

        // Update local storage
        localStorage.setItem(storageKey, String(result.has_liked));

        toast({
          title: result.has_liked ? "Post liked" : "Post unliked",
          // description: result.has_liked ? "You have liked this post" : "You have removed your like",
        });
      } else {
        // Handle unexpected response format
        throw new Error("Invalid response format from server");
      }

    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update like status",
        variant: "destructive",
      })
      // Optional: Revert state on error? Depends on desired UX.
      // Consider *not* reverting local storage on error, or handle specific errors
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
