"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Eye, Users, FileText, MessageSquare } from "lucide-react"
import { useToast } from "@/components/hooks/use-toast"
import AdminLoginForm from "@/components/admin-login-form"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { getAuthHeaders, getAuthToken } from "@/utils/auth"
import { useRouter } from "next/navigation"
import type { PostListItem } from "@/types"
import DeletePostDialog from "@/components/delete-post-dialog"

const stats = [
  {
    title: "Total Posts",
    value: "...",
    icon: FileText,
    change: "",
  },
  {
    title: "Total Views",
    value: "...",
    icon: Eye,
    change: "",
  },
  {
    title: "Comments",
    value: "...",
    icon: MessageSquare,
    change: "",
  },
  {
    title: "Subscribers",
    value: "...",
    icon: Users,
    change: "",
  },
]

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [token, setToken] = useState<string | null>(null)
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [postToDelete, setPostToDelete] = useState<PostListItem | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchPosts = async () => {
    if (isAuthenticatedState && token) {
      setIsLoadingPosts(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
        const response = await fetch(`${apiUrl}/admin/posts`, {
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          if (response.status === 401) {
            handleLogout()
            toast({
              title: "Session expired",
              description: "Please log in again.",
              variant: "destructive",
            })
            return
          }
          throw new Error("Failed to fetch posts")
        }

        const data: PostListItem[] = await response.json()
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setPosts(data)
      } catch (error) {
        console.error("Error fetching posts:", error)
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPosts(false)
      }
    }
  }

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const currentToken = getAuthToken()
        if (currentToken) {
          setToken(currentToken)
          setIsAuthenticatedState(true)
        } else {
          setToken(null)
          setIsAuthenticatedState(false)
        }
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticatedState && activeTab === "posts") {
      fetchPosts()
    }
    if (isAuthenticatedState && activeTab === "dashboard") {
      // Fetch dashboard stats if needed
    }
  }, [isAuthenticatedState, activeTab, token])

  const handleLogin = (success: boolean, newToken?: string) => {
    if (success && newToken) {
      setToken(newToken)
      setIsAuthenticatedState(true)
      setAuthChecked(true)
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      })
      setActiveTab("dashboard")
    } else {
      setIsAuthenticatedState(false)
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
    setToken(null)
    setIsAuthenticatedState(false)
    setAuthChecked(true)
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }

  const openDeleteDialog = (post: PostListItem) => {
    setPostToDelete(post)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setPostToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  const handleDeleteConfirm = async (permanent: boolean) => {
    if (!postToDelete) return

    setIsDeleting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api"
      const endpoint = permanent
        ? `${apiUrl}/admin/posts/${postToDelete.id}/permanent`
        : `${apiUrl}/admin/posts/${postToDelete.id}`

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout()
          toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" })
          return
        }
        const errorData = await response.json().catch(() => ({ error: "Failed to delete post" }))
        throw new Error(errorData.error || "Failed to delete post")
      }

      toast({
        title: permanent ? "Post Permanently Deleted" : "Post Moved to Trash",
        description: `Post "${postToDelete.title}" has been ${permanent ? "permanently deleted" : "moved to trash"}.`,
      })

      fetchPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error Deleting Post",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      closeDeleteDialog()
    }
  }

  if (!authChecked) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticatedState) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminLoginForm onLoginResult={handleLogin} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your blog content and settings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
            <Link href="/admin/posts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full rounded-md border border-dashed border-border flex items-center justify-center">
                <p className="text-muted-foreground">Traffic chart visualization (Coming Soon)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Manage Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search posts..." className="pl-8" />
                </div>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-12 items-center border-b bg-muted/50 px-4 py-3 font-medium text-sm">
                  <div className="col-span-6">Title</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-center">Date</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>

                {isLoadingPosts ? (
                  <div className="flex justify-center p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No posts found.</div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-0 hover:bg-muted/50">
                      <div className="col-span-6 flex items-center gap-2 truncate font-medium">
                        {post.image_url ? (
                          <Image
                            src={post.image_url}
                            alt={post.title}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded object-cover"
                            onError={(e) => {
                              ; (e.target as HTMLImageElement).style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="h-6 w-6 rounded bg-secondary"></div>
                        )}
                        <Link href={`/post/${post.id}`} className="hover:text-cyan-500 hover:underline" target="_blank" rel="noopener noreferrer">
                          {post.title}
                        </Link>
                      </div>
                      <div className="col-span-2 text-center">
                        <Badge variant={post.is_active ? "default" : "outline"} className={post.is_active ? "bg-green-600 hover:bg-green-700" : ""}>
                          {post.is_active ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-center text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</div>
                      <div className="col-span-2 flex justify-center gap-1">
                        <Button variant="ghost" size="icon" asChild title="Edit Post">
                          <Link href={`/admin/posts/edit/${post.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="View Post">
                          <Link href={`/post/${post.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(post)} title="Delete Post">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Manage Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full rounded-md border border-dashed border-border flex items-center justify-center">
                <p className="text-muted-foreground">Comments Management (Coming Soon)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Blog Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="blog-title" className="text-sm font-medium">
                  Blog Title
                </label>
                <Input id="blog-title" defaultValue="CyberTron" />
              </div>
              <div className="space-y-2">
                <label htmlFor="blog-description" className="text-sm font-medium">
                  Blog Description
                </label>
                <Textarea id="blog-description" defaultValue="Insights on cybersecurity, technology, and computer science topics" rows={3} />
              </div>
              <Button className="bg-cyan-600 hover:bg-cyan-700" disabled>
                Save Changes (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeletePostDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirmDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
        postTitle={postToDelete?.title || ""}
      />
    </div>
  )
}
