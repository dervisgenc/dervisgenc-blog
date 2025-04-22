"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/hooks/use-toast" // Corrected import path
import { Upload } from "lucide-react"
import { Cross2Icon } from "@radix-ui/react-icons"

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  currentImage?: string
}

export default function ImageUpload({ onImageUploaded, currentImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentImage || "")

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
      // In a real app, this would be an API call to upload the image
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await fetch('/api/admin/images/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (!response.ok) throw new Error('Failed to upload image');
      // const data = await response.json();
      // const imageUrl = data.url;

      // Simulate API call and create a local preview
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const imageUrl = URL.createObjectURL(file)

      setPreviewUrl(imageUrl)
      onImageUploaded(imageUrl)

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl("")
    onImageUploaded("")
  }

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt="Cover preview"
            className="aspect-video w-full rounded-md object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemoveImage}
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
          <label htmlFor="image-upload" className="flex cursor-pointer flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">{isUploading ? "Uploading..." : "Click to upload cover image"}</span>
            <span className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 5MB)</span>
          </label>
        </Card>
      )}
    </div>
  )
}
