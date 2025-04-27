"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Eye, Save } from "lucide-react"
import DynamicPostEditor from "@/components/dynamic-post-editor"
import ImageUpload from "@/components/image-upload"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { getAuthHeaders, isAuthenticated } from "@/utils/auth"

export default function NewPostPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined)
  const [post, setPost] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
    tags: "",
    readTime: 5,
    isPublished: true,
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin')
      toast("Unauthorized", {
        description: "Please log in to create a post.",
        action: { label: "Close", onClick: () => { } },
      })
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPost((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPost((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    const stateName = name === "isPublished" ? "isPublished" : name
    setPost((prev) => ({ ...prev, [stateName]: checked }))
  }

  const handleEditorChange = (content: string) => {
    setPost((prev) => ({ ...prev, content }))
  }

  const handleImageUploaded = (imageUrl: string) => {
    setCoverImageUrl(imageUrl)
  }

  const handlePreview = () => {
    if (!post.title) {
      toast("Title required", {
        description: "Please add a title before previewing",
        action: {
          label: "Close",
          onClick: () => { },
        },
      })
      return
    }
    setIsPreview(true)
  }

  const handleExitPreview = () => {
    setIsPreview(false)
  }

  const handleSave = async (publish = false) => {
    if (!post.title) {
      toast("Title required", {
        description: "Please add a title before saving",
        action: {
          label: "Close",
          onClick: () => { },
        },
      })
      return
    }

    setIsSubmitting(true)

    const payload = {
      title: post.title,
      content: post.content,
      description: post.summary,
      readTime: post.readTime,
      isActive: publish,
      imageUrl: coverImageUrl || "",
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
      const response = await fetch(`${apiUrl}/admin/posts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin')
          toast("Session expired", {
            description: "Please log in again.",
            action: { label: "Close", onClick: () => { } },
          })
          return
        }
        const errorData = await response.json().catch(() => ({ error: "Failed to save post" }))
        throw new Error(errorData.error || 'Failed to save post')
      }

      toast(publish ? "Post published" : "Draft saved", {
        description: publish ? "Your post has been published successfully" : "Your draft has been saved",
        action: {
          label: "Close",
          onClick: () => { },
        },
      })

      router.push("/admin")
    } catch (error) {
      console.error("Error saving post:", error)
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to save post. Please try again.",
        action: {
          label: "Close",
          onClick: () => { },
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isPreview) {
    const previewImageUrl = coverImageUrl || "/placeholder.svg"
    return (
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={handleExitPreview} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Editor
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </Button>
            <Button onClick={() => handleSave(true)} disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700">
              {isSubmitting ? "Publishing..." : "Publish Now"}
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">Preview Mode</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {previewImageUrl && previewImageUrl !== "/placeholder.svg" && (
              <div className="relative aspect-video w-full">
                <img
                  src={previewImageUrl}
                  alt={post.title || "Post preview"}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
              </div>
            )}
            <div className="p-6">
              <h1 className="mb-4 text-3xl font-bold">{post.title || "[No Title]"}</h1>
              {post.summary && <p className="mb-6 text-muted-foreground">{post.summary}</p>}
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || "<p>No content yet.</p>" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 flex items-center gap-1 text-muted-foreground">
          <ArrowLeftIcon className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground">Create and publish a new blog post</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={post.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={post.summary}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your post"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <DynamicPostEditor value={post.content} onChange={handleEditorChange} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  currentImage={coverImageUrl}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={post.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="privacy">Privacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={post.tags}
                  onChange={handleInputChange}
                  placeholder="security, hacking, defense (comma separated)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  name="readTime"
                  type="number"
                  value={post.readTime}
                  onChange={(e) => {
                    const value = e.target.value
                    const parsedValue = value === '' ? 0 : Math.max(0, Number(value))
                    setPost(prev => ({ ...prev, readTime: parsedValue }))
                  }}
                  min="0"
                />
              </div>
              <div className="flex items-center justify-between space-y-0">
                <Label htmlFor="published">Publish immediately</Label>
                <Switch
                  id="published"
                  name="isPublished"
                  checked={post.isPublished}
                  onCheckedChange={(checked) => handleSwitchChange("isPublished", checked)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreview} className="flex items-center gap-2" disabled={isSubmitting}>
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  onClick={() => handleSave(post.isPublished)}
                  disabled={isSubmitting}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {isSubmitting ? "Saving..." : post.isPublished ? "Publish" : "Save Draft"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
