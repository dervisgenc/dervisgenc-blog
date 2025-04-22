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
import PostEditor from "@/components/post-editor"
import ImageUpload from "@/components/image-upload"
import DeletePostDialog from "@/components/delete-post-dialog"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/hooks/use-toast"

// Mock data for a post
const mockPost = {
  id: "1",
  title: "Understanding Zero-Day Exploits: The Silent Threats",
  summary:
    "Zero-day vulnerabilities represent one of the most dangerous threats in cybersecurity. Learn how they work and how to protect yourself.",
  content: `<p>Zero-day vulnerabilities represent one of the most dangerous threats in cybersecurity. These are flaws in software or hardware that are unknown to those who should be interested in mitigating the vulnerability (including the vendor of the target software).</p>
      
  <p>The term "zero-day" refers to the fact that developers have had zero days to address and patch the vulnerability. Once the vulnerability becomes known, developers have literally "zero days" to fix it before hackers can exploit it.</p>
  
  <h2>Why Zero-Day Exploits Are Dangerous</h2>
  
  <p>Zero-day exploits are particularly dangerous for several reasons:</p>
  
  <ul>
    <li>They are unknown to the software vendor, meaning there are no patches or fixes available.</li>
    <li>Traditional security measures like antivirus software may not detect them since they're previously unknown threats.</li>
    <li>They can remain undetected for months or even years, allowing attackers prolonged access to compromised systems.</li>
    <li>They are highly valued in underground markets, with prices ranging from thousands to millions of dollars.</li>
  </ul>`,
  coverImage: "/placeholder.svg?height=600&width=1200",
  category: "cybersecurity",
  tags: "security, vulnerabilities, hacking, defense",
  isPublished: true,
}
export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [post, setPost] = useState({
    id: "",
    title: "",
    summary: "",
    content: "",
    coverImage: "",
    category: "",
    tags: "",
    isPublished: true,
  })

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // In a real app, this would be an API call to get the post
        // const response = await fetch(`/api/admin/posts/${params.id}`);
        // if (!response.ok) throw new Error('Failed to fetch post');
        // const data = await response.json();
        // setPost(data);

        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 500))
        setPost({
          ...mockPost,
          id: params.id,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load post. Please try again.",
          variant: "destructive",
        })
        router.push("/admin")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPost((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPost((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setPost((prev) => ({ ...prev, [name]: checked }))
  }

  const handleEditorChange = (content: string) => {
    setPost((prev) => ({ ...prev, content }))
  }

  const handleImageUpload = (imageUrl: string) => {
    setPost((prev) => ({ ...prev, coverImage: imageUrl }))
  }

  const handlePreview = () => {
    if (!post.title) {
      toast({
        title: "Title required",
        description: "Please add a title before previewing",
        variant: "destructive",
      })
      return
    }
    setIsPreview(true)
  }

  const handleExitPreview = () => {
    setIsPreview(false)
  }

  const handleSave = async (publish: boolean = post.isPublished) => {
    if (!post.title) {
      toast({
        title: "Title required",
        description: "Please add a title before saving",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to update the post
      // const response = await fetch(`/api/admin/posts/${post.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...post,
      //     isPublished: publish,
      //     tags: post.tags.split(',').map(tag => tag.trim())
      //   }),
      // });

      // if (!response.ok) throw new Error('Failed to update post');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: publish ? "Post updated and published" : "Draft updated",
        description: publish ? "Your post has been updated and published" : "Your draft has been updated",
      })

      router.push("/admin")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (permanent = false) => {
    try {
      // In a real app, this would be an API call to delete the post
      // const endpoint = permanent
      //   ? `/api/admin/posts/${post.id}/permanent`
      //   : `/api/admin/posts/${post.id}`;
      // const response = await fetch(endpoint, { method: 'DELETE' });
      // if (!response.ok) throw new Error('Failed to delete post');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: permanent ? "Post permanently deleted" : "Post moved to trash",
        description: permanent
          ? "Your post has been permanently deleted"
          : "Your post has been moved to trash and can be restored later",
      })

      router.push("/admin")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
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

  if (isPreview) {
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
              Save as Draft
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
            {post.coverImage && (
              <div className="relative aspect-video w-full">
                <img
                  src={post.coverImage || "/placeholder.svg"}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>
              {post.summary && <p className="mb-6 text-muted-foreground">{post.summary}</p>}
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">Edit and update your blog post</p>
        </div>
        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="flex items-center gap-2">
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
                <PostEditor value={post.content} onChange={handleEditorChange} />
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
                <ImageUpload onImageUploaded={handleImageUpload} currentImage={post.coverImage} />
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
              <div className="flex items-center justify-between space-y-0">
                <Label htmlFor="published">Published</Label>
                <Switch
                  id="published"
                  checked={post.isPublished}
                  onCheckedChange={(checked) => handleSwitchChange("isPublished", checked)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreview} className="flex items-center gap-2">
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
        onDelete={handleDelete}
      />
    </div>
  )
}
