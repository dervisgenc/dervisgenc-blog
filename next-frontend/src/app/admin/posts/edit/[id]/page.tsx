"use client" // Assuming this might be a client component based on the error context

import type React from "react" // Import React
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation" // Import useParams
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Eye, Save, Trash2, ArrowLeftIcon as LucideArrowLeftIcon } from "lucide-react" // Use Lucide icon
import DynamicPostEditor from "@/components/dynamic-post-editor"
import ImageUpload from "@/components/image-upload"
import DeletePostDialog from "@/components/delete-post-dialog"
// import { ArrowLeftIcon } from "@radix-ui/react-icons" // Using Lucide version now
import { toast } from "sonner"
import { getAuthHeaders, isAuthenticated } from "@/utils/auth"
import { Post } from "@/types" // Ensure Post type includes category and tags

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams() // Use the hook to get params
  const postId = params.id as string // Access id from the hook's result, cast if needed

  // Use a single state object for the post, matching the Post type
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined)
  const [isPreview, setIsPreview] = useState(false) // Add isPreview state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false) // Add delete dialog state

  useEffect(() => {
    // ... authentication check ...
    if (!isAuthenticated()) {
      router.push('/admin')
      toast("Unauthorized", { description: "Please log in." })
      return
    }

    if (!postId) {
      toast("Error", { description: "Post ID is missing." })
      setLoading(false)
      return
    }

    const fetchPost = async () => {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
        const response = await fetch(`${apiUrl}/admin/posts/${postId}`, { // Use postId from hook
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          if (response.status === 404) {
            toast("Error", { description: "Post not found." })
            router.push("/admin/posts") // Redirect if not found
          } else if (response.status === 401) {
            router.push('/admin')
            toast("Session expired", { description: "Please log in again." })
          } else {
            const errorData = await response.json().catch(() => ({ error: "Failed to fetch post data" }))
            throw new Error(errorData.error || "Failed to fetch post data")
          }
          return
        }
        const data: Post = await response.json() // Use your Post type
        setPost({
          ...data,
          summary: data.summary || '', // Ensure summary is not null/undefined
          category: data.category || '', // Ensure category is not null/undefined
          tags: data.tags || '',       // Ensure tags are not null/undefined
          content: data.content || '',
          read_time: data.read_time || 0,
          like_count: data.like_count || 0,
          // is_active is already handled
        })
        setCoverImageUrl(data.image_url || undefined)
      } catch (error) {
        console.error("Error fetching post:", error)
        toast("Error", { description: error instanceof Error ? error.message : "Failed to load post data." })
        setPost(null) // Set post to null on error
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId, router]) // Depend on postId from the hook

  // Use a single handler for most inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPost((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // Specific handler for numeric inputs like read_time
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = value === "" ? 0 : Math.max(0, Number(value));
    setPost((prev) => (prev ? { ...prev, [name]: parsedValue } : null));
  };


  const handleSelectChange = (name: string, value: string) => {
    setPost((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    // Use 'is_active' directly as it matches the Post type
    setPost((prev) => (prev ? { ...prev, [name]: checked } : null))
  }

  const handleEditorChange = (content: string) => {
    setPost((prev) => (prev ? { ...prev, content } : null))
  }

  const handleImageUploaded = (imageUrl: string) => {
    setCoverImageUrl(imageUrl)
    // Optionally update post state if image_url is part of it
    // setPost((prev) => (prev ? { ...prev, image_url: imageUrl } : null));
  }

  // ... handlePreview, handleExitPreview ...
  const handlePreview = () => {
    if (!post?.title) {
      toast("Title required", {
        description: "Please add a title before previewing",
        action: { label: "Close", onClick: () => { } },
      })
      return
    }
    setIsPreview(true) // Use the state setter
  }

  const handleExitPreview = () => {
    setIsPreview(false) // Use the state setter
  }


  const handleSave = async (publish: boolean) => {
    if (!post || !postId) return // Check if post data and postId are available

    setIsSubmitting(true)

    // Ensure payload matches backend DTO expectations (PostUpdateRequest)
    const payload = {
      title: post.title,
      content: post.content,
      description: post.summary, // Map frontend 'summary' to backend 'description'
      readTime: post.read_time, // Map frontend 'read_time' to backend 'readTime'
      isActive: publish,        // Use 'publish' flag for isActive
      imageUrl: coverImageUrl || "",
      category: post.category,  // Include category
      tags: post.tags,          // Include tags
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
      const response = await fetch(`${apiUrl}/admin/posts/${postId}`, { // Use postId in URL
        method: 'PUT', // Use PUT for updates
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
        const errorData = await response.json().catch(() => ({ error: "Failed to update post" }))
        throw new Error(errorData.error || 'Failed to update post')
      }

      toast("Post updated", {
        description: "Your post has been updated successfully.",
        action: {
          label: "Close",
          onClick: () => { },
        },
      })

      router.push("/admin") // Redirect to the main admin page

    } catch (error) {
      console.error("Error updating post:", error)
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to update post. Please try again.",
        action: {
          label: "Close",
          onClick: () => { },
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ... handleDeleteConfirm ...
  const handleDeleteConfirm = async (permanent: boolean) => {
    if (!postId) return;

    setIsSubmitting(true); // Use isSubmitting to disable buttons during delete
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api";
      const endpoint = permanent
        ? `${apiUrl}/admin/posts/${postId}/permanent` // Permanent delete endpoint
        : `${apiUrl}/admin/posts/${postId}`;          // Soft delete endpoint (moves to trash)

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin');
          toast("Session expired", { description: "Please log in again." });
          return;
        }
        const errorData = await response.json().catch(() => ({ error: "Failed to delete post" }));
        throw new Error(errorData.error || 'Failed to delete post');
      }

      toast(permanent ? "Post Permanently Deleted" : "Post Moved to Trash", {
        description: `The post "${post?.title || 'Post'}" has been ${permanent ? 'permanently deleted' : 'moved to trash'}.`,
      });
      router.push("/admin"); // Redirect to the main admin page after delete

    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error Deleting Post", { // Using toast.error instead of variant
        description: error instanceof Error ? error.message : "Failed to delete post. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false); // Close the dialog
    }
  };


  if (loading) {
    // ... loading state ...
    return (
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent"></div>
          <p className="text-muted-foreground">Loading Post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    // ... post not found state ...
    return (
      <div className="container py-6 text-center">
        <p className="mb-4 text-lg text-destructive">Post not found or failed to load.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <LucideArrowLeftIcon className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Add Preview Mode Rendering
  if (isPreview) {
    const previewImageUrl = coverImageUrl || "/placeholder.svg"
    return (
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={handleExitPreview} className="flex items-center gap-2">
            <LucideArrowLeftIcon className="h-4 w-4" />
            Back to Editor
          </Button>
          <div className="flex gap-2">
            {/* Keep Save Draft/Publish buttons if needed in preview, or just Save Changes */}
            <Button onClick={() => handleSave(post.is_active)} disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700">
              {isSubmitting ? "Saving..." : "Save Changes"}
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
              {/* Display Category and Tags in Preview */}
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
                {post.category && (
                  <span className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-0.5 text-xs font-medium text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                    {post.category}
                  </span>
                )}
                {post.tags && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
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


  // Main Edit Form
  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 flex items-center gap-1 text-muted-foreground">
            <LucideArrowLeftIcon className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">Edit and update your blog post</p>
        </div>
        <Button
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)} // Use state setter
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
                  name="title" // Name matches Post state key
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
                  name="summary" // Name matches Post state key
                  value={post.summary || ""}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your post"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                {/* Ensure DynamicPostEditor handles potential null/undefined gracefully or check post.content */}
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
                  currentImage={coverImageUrl ?? undefined}
                />
              </div>
              {/* Category Select */}
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
                    {/* Add more categories */}
                  </SelectContent>
                </Select>
              </div>
              {/* Tags Input */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags" // Name matches Post state key
                  value={post.tags || ""}
                  onChange={handleInputChange}
                  placeholder="security, hacking, defense (comma separated)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="read_time">Read Time (minutes)</Label>
                <Input
                  id="read_time"
                  name="read_time" // Name matches Post state key
                  type="number"
                  value={post.read_time || 5}
                  onChange={handleNumberInputChange} // Use specific handler for numbers
                  min="0"
                />
              </div>
              <div className="flex items-center justify-between space-y-0">
                <Label htmlFor="is_active">Published</Label>
                <Switch
                  id="is_active"
                  name="is_active" // Name matches Post state key
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
                  onClick={handlePreview} // Use handlePreview
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={() => handleSave(post.is_active)} disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <DeletePostDialog
        isOpen={isDeleteDialogOpen} // Use state variable
        onClose={() => setIsDeleteDialogOpen(false)} // Use state setter
        onConfirmDelete={handleDeleteConfirm} // Pass the new handler function
        isDeleting={isSubmitting} // Use isSubmitting to indicate deletion in progress
        postTitle={post?.title || ""} // Pass post title for confirmation message
      />
    </div>
  )
}
