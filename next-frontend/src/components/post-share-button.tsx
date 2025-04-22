"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Share, Facebook, Twitter, Linkedin } from "lucide-react"
import { toast } from "@/components/hooks/use-toast"
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons"

interface PostShareButtonProps {
  postId: string
  title: string
}

export default function PostShareButton({ postId, title }: PostShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const encodedShareUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)

    // Track share in backend
    trackShare(postId, "copy")

    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const trackShare = async (postId: string, platform: string) => {
    try {
      // In a real app, this would be an API call to /api/posts/:id/share
      // const response = await fetch(`/api/posts/${postId}/share`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ platform }),
      // });
      // if (!response.ok) throw new Error('Failed to track share');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error("Failed to track share:", error)
    }
  }

  const handleSocialShare = (platform: string, url: string) => {
    trackShare(postId, platform)
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Share className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            handleSocialShare("facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`)
          }
        >
          <Facebook className="mr-2 h-4 w-4" />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            handleSocialShare("twitter", `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}`)
          }
        >
          <Twitter className="mr-2 h-4 w-4" />
          <span>Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            handleSocialShare("linkedin", `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`)
          }
        >
          <Linkedin className="mr-2 h-4 w-4" />
          <span>LinkedIn</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="mr-2 h-4 w-4" />
              <span>Copy Link</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
