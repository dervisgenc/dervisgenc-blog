"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Import Select components
import { Switch } from "@/components/ui/switch"
import { Eye, Save, ArrowLeftIcon } from "lucide-react" // Use lucide icon
import DynamicPostEditor from "@/components/dynamic-post-editor"
import ImageUpload from "@/components/image-upload"
import { toast } from "sonner"
import { getAuthHeaders, isAuthenticated } from "@/utils/auth"

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [content, setContent] = useState("")
  const [readTime, setReadTime] = useState(0)
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined)
  const [category, setCategory] = useState("") // Add category state
  const [tags, setTags] = useState("") // Add tags state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin')
      toast("Unauthorized", { description: "Please log in." })
    }
  }, [router])

  const handleImageUploaded = (imageUrl: string) => {
    setCoverImageUrl(imageUrl)
  }

  const handlePreview = () => {
    if (!title) {
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

  const handleSave = async (publish: boolean) => {
    setIsSubmitting(true)

    const payload = {
      title,
      content,
      description: summary, // Map frontend 'summary' to backend 'description'
      readTime,
      isActive: publish,
      imageUrl: coverImageUrl || "", // Send empty string if undefined
      category: category, // Include category
      tags: tags, // Include tags
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
      const response = await fetch(`${apiUrl}/admin/posts`, {
        method: 'POST',
        headers: getAuthHeaders(), // Uses helper to get headers with token
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

      router.push("/admin") // Redirect to the main admin page
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
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
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
                  alt={title || "Post preview"}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
              </div>
            )}
            <div className="p-6">
              <h1 className="mb-4 text-3xl font-bold">{title || "[No Title]"}</h1>
              {summary && <p className="mb-6 text-muted-foreground">{summary}</p>}
              {/* Display Category and Tags in Preview */}
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
                {category && (
                  <span className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-0.5 text-xs font-medium text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                    {category}
                  </span>
                )}
                {tags && (
                  <div className="flex flex-wrap gap-1">
                    {tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content || "<p>No content yet.</p>" }}
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
          <h1 className="text-2xl font-bold">Create New Post</h1>
          <p className="text-muted-foreground">Fill in the details for your new blog post</p>
        </div>
        {/* Buttons moved to CardFooter */}
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary of your post"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <DynamicPostEditor value={content} onChange={setContent} />
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
                <ImageUpload onImageUploaded={handleImageUploaded} />
              </div>
              {/* Category Select */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="privacy">Privacy</SelectItem>
                    {/* Add more categories as needed */}
                  </SelectContent>
                </Select>
              </div>
              {/* Tags Input */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="security, hacking, defense (comma separated)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  value={readTime}
                  onChange={(e) => setReadTime(Math.max(0, Number(e.target.value)))}
                  min="0"
                />
              </div>
              {/* Publish Switch - Consider removing if using Save Draft/Publish buttons */}
              {/* <div className="flex items-center justify-between space-y-0">
                <Label htmlFor="published">Published</Label>
                <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
              </div> */}
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
                {/* <Button
                  variant="secondary" // Changed Save Draft to secondary
                  onClick={() => handleSave(false)} // Save Draft (isActive: false)
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Draft"}
                </Button> */}
                <Button
                  onClick={() => handleSave(true)} // Publish (isActive: true)
                  disabled={isSubmitting}
                  className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
                >
                  {isSubmitting ? "Publishing..." : "Publish Post"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
