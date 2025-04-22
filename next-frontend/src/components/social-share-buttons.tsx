"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin } from "lucide-react"
import { toast } from "@/components/hooks/use-toast"
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons"

interface SocialShareButtonsProps {
  title: string
}

export default function SocialShareButtons({ title }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const encodedShareUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-xl font-bold">Share this article</h3>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook className="h-4 w-4" />
            <span>Facebook</span>
          </a>
        </Button>

        <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="h-4 w-4" />
            <span>Twitter</span>
          </a>
        </Button>

        <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin className="h-4 w-4" />
            <span>LinkedIn</span>
          </a>
        </Button>

        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleCopyLink}>
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4" />
              <span>Copy Link</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
