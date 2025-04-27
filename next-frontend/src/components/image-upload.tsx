"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/hooks/use-toast" // Corrected import path
import { Upload } from "lucide-react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { getAuthHeaders } from "@/utils/auth" // Import auth headers utility
import type { ImageUploadResponse } from "@/types" // Import response type

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  currentImage?: string // This should be the persistent URL from the backend
}

export default function ImageUpload({ onImageUploaded, currentImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  // Use currentImage prop to initialize previewUrl
  const [previewUrl, setPreviewUrl] = useState(currentImage || "")

  // Update previewUrl if currentImage prop changes externally
  useEffect(() => {
    setPreviewUrl(currentImage || "")
  }, [currentImage])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Actual API call to upload the image
      const formData = new FormData()
      formData.append("image", file)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
      const response = await fetch(`${apiUrl}/admin/images/upload`, {
        method: "POST",
        headers: getAuthHeaders(true), // Use true for FormData
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to upload image" }))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: ImageUploadResponse = await response.json()
      const persistentImageUrl = data.url // Get the persistent URL from backend

      // Update preview and notify parent component with the persistent URL
      setPreviewUrl(persistentImageUrl)
      onImageUploaded(persistentImageUrl)

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      })
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      // Optionally revert preview if needed
      // setPreviewUrl(currentImage || "");
    } finally {
      setIsUploading(false)
      // Reset file input value to allow re-uploading the same file
      e.target.value = ""
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl("")
    onImageUploaded("") // Notify parent that image is removed
  }

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative">
          <img
            // Use previewUrl which holds the persistent URL or the initial currentImage
            src={previewUrl}
            alt="Cover preview"
            className="aspect-video w-full rounded-md object-cover"
            // Add error handling for image loading
            onError={(e) => {
              console.warn("Failed to load image:", previewUrl)
                // Optionally set a placeholder if the image fails to load
                ; (e.target as HTMLImageElement).src = "/placeholder.svg"
            }}
          />
          <Button
            type="button" // Ensure it doesn't submit forms
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6" // Smaller button
            onClick={handleRemoveImage}
            disabled={isUploading} // Disable remove while uploading
          >
            <Cross2Icon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Card className="flex aspect-video flex-col items-center justify-center border-dashed p-4">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <label
            htmlFor="image-upload"
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 ${isUploading ? "opacity-50" : ""
              }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">{isUploading ? "Uploading..." : "Click to upload cover image"}</span>
            <span className="text-xs text-muted-foreground">PNG, JPG, GIF (max. 5MB)</span>
          </label>
        </Card>
      )}
    </div>
  )
}
