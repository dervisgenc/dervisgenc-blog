"use client"

import { useState, useEffect, Suspense } from "react" // Import Suspense
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Eye, Users, FileText, MessageSquare, Share2, Heart } from "lucide-react" // Added Share2, Heart
import { useToast } from "@/components/hooks/use-toast"
import AdminLoginForm from "@/components/admin-login-form"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { getAuthHeaders, getAuthToken } from "@/utils/auth"
import { useRouter } from "next/navigation"
import type { PostListItem, OverallStatsResponse, DetailedStatsResponse, PostDetailedStats, DailyTrafficStat } from "@/types" // Import DailyTrafficStat
import DeletePostDialog from "@/components/delete-post-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import TrafficChart from "@/components/traffic-chart" // Import the new chart component
import ImageWithFallback from "@/components/image-with-fallback" // Import the new component
import { Skeleton } from "@/components/ui/skeleton" // Import Skeleton for fallback

// Initial state for overall stats
const initialOverallStats: OverallStatsResponse = {
  total_posts: 0,
  total_views: 0,
  total_likes: 0,
  total_shares: 0,
};

// Define the main AdminPage component (keep existing logic)
function AdminPageComponent() {
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [token, setToken] = useState<string | null>(null)
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [postToDelete, setPostToDelete] = useState<PostListItem | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [overallStats, setOverallStats] = useState<OverallStatsResponse>(initialOverallStats);
  const [detailedPostStats, setDetailedPostStats] = useState<PostDetailedStats[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [trafficData, setTrafficData] = useState<DailyTrafficStat[]>([]); // State for traffic chart
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(false); // Loading state for traffic chart

  const router = useRouter()
  const { toast } = useToast()

  // --- Fetch Overall Stats ---
  const fetchOverallStats = async () => {
    if (!isAuthenticatedState || !token) return;
    setIsLoadingStats(true); // Use the general stats loading indicator
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api";
      const response = await fetch(`${apiUrl}/admin/stats/overall`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) handleLogout();
        throw new Error("Failed to fetch overall stats");
      }

      const data: OverallStatsResponse = await response.json();
      setOverallStats(data);
    } catch (error) {
      console.error("Error fetching overall stats:", error);
      toast({
        title: "Error",
        description: "Failed to load overall stats.",
        variant: "destructive",
      });
      setOverallStats(initialOverallStats); // Reset on error
    } finally {
      // setIsLoadingStats(false); // Set loading false after all stats fetches complete
    }
  };

  // --- Fetch Detailed Post Stats ---
  const fetchDetailedPostStats = async () => {
    if (!isAuthenticatedState || !token) return;
    // setIsLoadingStats(true); // Use the general stats loading indicator
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api";
      const response = await fetch(`${apiUrl}/admin/posts/detailed-stats`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) handleLogout();
        throw new Error("Failed to fetch detailed post stats");
      }

      const data: DetailedStatsResponse = await response.json();
      setDetailedPostStats(data.post_stats || []);
    } catch (error) {
      console.error("Error fetching detailed post stats:", error);
      toast({
        title: "Error",
        description: "Failed to load detailed post stats.",
        variant: "destructive",
      });
      setDetailedPostStats([]);
    } finally {
      setIsLoadingStats(false); // Set loading false after all stats fetches complete
    }
  };

  // --- Fetch Traffic Data ---
  const fetchTrafficData = async () => {
    if (!isAuthenticatedState || !token) return;
    setIsLoadingTraffic(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blog.dervisgenc.com/api";
      // Add date range parameters if needed, e.g., ?start_date=...&end_date=...
      const response = await fetch(`${apiUrl}/admin/stats/traffic`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) handleLogout();
        throw new Error("Failed to fetch traffic data");
      }

      const data: DailyTrafficStat[] = await response.json();
      setTrafficData(data);
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      toast({
        title: "Error",
        description: "Failed to load traffic data.",
        variant: "destructive",
      });
      setTrafficData([]); // Reset on error
    } finally {
      setIsLoadingTraffic(false);
    }
  };


  const fetchPosts = async () => {
    // ... (fetchPosts implementation remains the same) ...
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
      // ... (checkAuth implementation remains the same) ...
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
    if (isAuthenticatedState) {
      if (activeTab === "posts") {
        fetchPosts();
      }
      if (activeTab === "dashboard") {
        // Fetch all dashboard data
        fetchOverallStats();
        fetchDetailedPostStats();
        fetchTrafficData(); // Fetch traffic data
      }
    }
  }, [isAuthenticatedState, activeTab, token]);

  // ... handleLogin, handleLogout, delete dialog logic ...
  const handleLogin = (success: boolean, newToken?: string) => {
    if (success && newToken) {
      setToken(newToken)
      setIsAuthenticatedState(true)
      setAuthChecked(true)
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      })
      setActiveTab("dashboard") // Switch to dashboard on login
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
    setAuthChecked(true) // Keep authChecked true
    setOverallStats(initialOverallStats); // Reset stats on logout
    setDetailedPostStats([]);
    setTrafficData([]); // Reset traffic data
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    // No need to redirect here, the component will re-render the login form
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

      // Refresh data depending on the active tab
      if (activeTab === 'posts') {
        fetchPosts()
      } else if (activeTab === 'dashboard') {
        fetchDetailedPostStats(); // Refresh detailed stats if a post is deleted
        fetchOverallStats(); // Refresh overall stats
        fetchTrafficData(); // Refresh traffic data
      }

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


  // --- Loading/Login Screens remain the same ---
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


  // --- Map fetched stats to card data ---
  const dashboardStats = [
    { title: "Total Posts", value: overallStats.total_posts, icon: FileText },
    { title: "Total Views", value: overallStats.total_views, icon: Eye },
    { title: "Total Likes", value: overallStats.total_likes, icon: Heart }, // Use Heart icon
    { title: "Total Shares", value: overallStats.total_shares, icon: Share2 }, // Use Share2 icon
  ];


  return (
    <div className="container py-6">
      {/* ... Header and Buttons ... */}
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
        {/* ... TabsList ... */}
        <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>


        <TabsContent value="dashboard" className="space-y-6">
          {/* Overall Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? "..." : stat.value}
                  </div>
                  {/* Optional: Add change indicator if backend provides it */}
                </CardContent>
              </Card>
            ))}
          </div>


          {/* Traffic Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview (Last 30 Days)</CardTitle>
              {/* Add date range picker here later if needed */}
            </CardHeader>
            <CardContent>
              {/* Replace placeholder with TrafficChart component */}
              <div className="h-[300px] w-full">
                <TrafficChart data={trafficData} isLoading={isLoadingTraffic} />
              </div>
            </CardContent>
          </Card>

          {/* Detailed Post Stats Table */}
          <Card>
            <CardHeader>
              <CardTitle>Post Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex justify-center p-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent"></div>
                </div>
              ) : detailedPostStats.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No post statistics available.</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60%]">Title</TableHead>
                        <TableHead className="text-center">Views</TableHead>
                        <TableHead className="text-center">Likes</TableHead>
                        <TableHead className="text-center">Shares</TableHead>
                        {/* <TableHead className="text-right">Created</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedPostStats.map((postStat) => (
                        <TableRow key={postStat.post_id}>
                          <TableCell className="font-medium truncate">
                            <Link href={`/post/${postStat.post_id}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-cyan-500">
                              {postStat.title}
                            </Link>
                          </TableCell>
                          <TableCell className="text-center">{postStat.views}</TableCell>
                          <TableCell className="text-center">{postStat.likes}</TableCell>
                          <TableCell className="text-center">{postStat.shares}</TableCell>
                          {/* <TableCell className="text-right text-muted-foreground text-xs">{new Date(postStat.created_at).toLocaleDateString()}</TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        {/* Posts Tab Content */}
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Manage Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {/* ... Search Input ... */}
              <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search posts..." className="pl-8" />
                </div>
              </div>

              {/* Posts Table */}
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
                          /* Replace Image with ImageWithFallback */
                          <ImageWithFallback
                            src={post.image_url}
                            fallbackSrc="/placeholder.svg" // Or a smaller placeholder
                            alt={post.title}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded object-cover"
                          // onError is handled internally
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


        {/* Comments Tab Content */}
        <TabsContent value="comments">
          {/* ... Comments Placeholder ... */}
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


        {/* Settings Tab Content */}
        <TabsContent value="settings">
          {/* ... Settings Form ... */}
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

      {/* Delete Dialog */}
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

// Define a loading fallback component
function LoadingFallback() {
    return (
        <div className="container flex min-h-screen items-center justify-center py-12">
            <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent"></div>
                <p className="text-muted-foreground">Loading Admin...</p>
            </div>
        </div>
    );
}


// Wrap the main component with Suspense
export default function AdminPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <AdminPageComponent />
        </Suspense>
    );
}
