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
import { Eye, Save, Trash2 } from "lucide-react"
import DynamicPostEditor from "@/components/dynamic-post-editor"
import ImageUpload from "@/components/image-upload"
import DeletePostDialog from "@/components/delete-post-dialog"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { getAuthHeaders, isAuthenticated } from "@/utils/auth"
import type { Post } from "@/types"

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const postId = params.id
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCoverImageUrl, setCurrentCoverImageUrl] = useState<string | null>(null)
  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/admin")
      toast("Unauthorized", {
        description: "Please log in to edit posts.",
        action: { label: "Close", onClick: () => { } },
      })
    }
  }, [router])

  useEffect(() => {
    const fetchPost = async () => {
      if (!isAuthenticated() || !postId) return

      setIsLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
        const response = await fetch(`${apiUrl}/admin/posts/${postId}`, {
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/admin")
            toast("Session expired", {
              description: "Please log in again.",
              action: { label: "Close", onClick: () => { } },
            })
            return
          }
          if (response.status === 404) {
            throw new Error("Post not found")
          }
          const errorData = await response.json().catch(() => ({ message: "Failed to fetch post" }))
          throw new Error(errorData.message || "Failed to fetch post")
        }
        const data: Post = await response.json()
        setPost({
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
        })
        setCurrentCoverImageUrl(data.image_url)
      } catch (error) {
        console.error("Error fetching post:", error)
        toast("Error", {
          description: error instanceof Error ? error.message : "Failed to load post. Please try again.",
          action: { label: "Close", onClick: () => { } },
        })
        if (error instanceof Error && error.message === "Post not found") {
          router.push("/admin")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPost((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPost((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setPost((prev) => (prev ? { ...prev, [name]: checked } : null))
  }

  const handleEditorChange = (content: string) => {
    setPost((prev) => (prev ? { ...prev, content } : null))
  }

  const handleImageUploaded = (imageUrl: string) => {
    setCurrentCoverImageUrl(imageUrl)
  }

  const handlePreview = () => {
    if (!post?.title) {
      toast("Title required", {
        description: "Please add a title before previewing",
        action: { label: "Close", onClick: () => { } },
      })
      return
    }
    setIsPreview(true)
  }

  const handleExitPreview = () => {
    setIsPreview(false)
  }

  const handleSave = async (publish?: boolean) => {
    if (!post || !post.title) {
      toast("Title required", {
        description: "Please add a title before saving",
        action: { label: "Close", onClick: () => { } },
      })
      return
    }

    setIsSubmitting(true)

    const isActive = typeof publish === "boolean" ? publish : post.is_active
    const payload = {
      title: post.title,
      content: post.content || "",
      description: post.summary || "",
      readTime: post.read_time || 0,
      isActive: isActive,
      imageUrl: currentCoverImageUrl || "",
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
      const response = await fetch(`${apiUrl}/admin/posts/${postId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/admin")
          toast("Session expired", {
            description: "Please log in again.",
            action: { label: "Close", onClick: () => { } },
          })
          return
        }
        const errorData = await response.json().catch(() => ({ error: "Failed to update post" }))
        throw new Error(errorData.error || "Failed to update post")
      }

      toast(isActive ? "Post updated and published" : "Draft updated", {
        description: isActive ? "Your post has been updated and published" : "Your draft has been updated",
        action: { label: "Close", onClick: () => { } },
      })

      router.push("/admin")
    } catch (error) {
      console.error("Error updating post:", error)
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to update post. Please try again.",
        action: { label: "Close", onClick: () => { } },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (permanent = false) => {
    if (!post) return
    setIsSubmitting(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
      const endpoint = permanent
        ? `${apiUrl}/admin/posts/${postId}/permanent`
        : `${apiUrl}/admin/posts/${postId}`

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/admin")
          toast("Session expired", {
            description: "Please log in again.",
            action: { label: "Close", onClick: () => { } },
          })
          return
        }
        const errorData = await response.json().catch(() => ({ error: "Failed to delete post" }))
        throw new Error(errorData.error || "Failed to delete post")
      }

      toast(permanent ? "Post permanently deleted" : "Post moved to trash", {
        description: permanent
          ? "Your post has been permanently deleted"
          : "Your post has been moved to trash",
        action: { label: "Close", onClick: () => { } },
      })

      router.push("/admin")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to delete post. Please try again.",
        action: { label: "Close", onClick: () => { } },
      })
    } finally {
      setIsSubmitting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-6 w-6 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent"></div>
          <p>Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500 mb-4">Could not load post data. It might have been deleted or an error occurred.</p>
        <Button onClick={() => router.push("/admin")} className="mt-4">
          Back to Admin Dashboard
        </Button>
      </div>
    )
  }

  if (isPreview) {
    const previewImageUrl = currentCoverImageUrl || "/placeholder.svg"
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
              {isSubmitting ? "Publishing..." : "Update & Publish"}
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
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
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
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 flex items-center gap-1 text-muted-foreground">
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">Edit and update your blog post</p>
        </div>
        <Button
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="flex items-center gap-2"
          disabled={isSubmitting}
        >
          <Trash2 className="h-4 w-4" />
          Delete Post
        </Button>
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
                  value={post.summary || ""}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your post"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <DynamicPostEditor value={post.content ?? ""} onChange={handleEditorChange} />
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
                  currentImage={currentCoverImageUrl ?? undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={post.category || ""} onValueChange={(value) => handleSelectChange("category", value)}>
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
                  value={post.tags || ""}
                  onChange={handleInputChange}
                  placeholder="security, hacking, defense (comma separated)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  name="read_time"
                  type="number"
                  value={post.read_time || 0}
                  onChange={(e) => {
                    const value = e.target.value
                    const parsedValue = value === "" ? 0 : Math.max(0, Number(value))
                    setPost((prev) => (prev ? { ...prev, read_time: parsedValue } : null))
                  }}
                  min="0"
                />
              </div>
              <div className="flex items-center justify-between space-y-0">
                <Label htmlFor="published">Published</Label>
                <Switch
                  id="published"
                  name="is_active"
                  checked={post.is_active}
                  onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={() => handleSave()} disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700">
                  {isSubmitting ? "Saving..." : "Update Post"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <DeletePostDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirmDelete={handleDelete}
        isDeleting={isSubmitting}
      />
    </div>
  )
}
