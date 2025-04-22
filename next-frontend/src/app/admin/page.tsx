"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, Eye, Users, FileText, MessageSquare } from "lucide-react"
import { toast } from "@/components/hooks/use-toast"
import AdminLoginForm from "@/components/admin-login-form"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"

// Mock data for posts
const posts = [
  {
    id: "1",
    title: "Understanding Zero-Day Exploits: The Silent Threats",
    status: "published",
    date: "22 Apr 2025",
    views: 1245,
    comments: 38,
  },
  {
    id: "2",
    title: "The Rise of Quantum Computing and Its Impact on Encryption",
    status: "published",
    date: "18 Apr 2025",
    views: 876,
    comments: 24,
  },
  {
    id: "3",
    title: "Building Secure APIs: Best Practices for Developers",
    status: "draft",
    date: "15 Apr 2025",
    views: 0,
    comments: 0,
  },
  {
    id: "4",
    title: "The Dark Side of AI: Ethical Concerns in Machine Learning",
    status: "published",
    date: "10 Apr 2025",
    views: 654,
    comments: 15,
  },
]

// Mock data for dashboard stats
const stats = [
  {
    title: "Total Posts",
    value: "24",
    icon: FileText,
    change: "+12% from last month",
  },
  {
    title: "Total Views",
    value: "12.5K",
    icon: Eye,
    change: "+18% from last month",
  },
  {
    title: "Comments",
    value: "342",
    icon: MessageSquare,
    change: "+7% from last month",
  },
  {
    title: "Subscribers",
    value: "1.2K",
    icon: Users,
    change: "+24% from last month",
  },
]

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true)
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
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
        <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
          <Link href="/admin/posts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
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
                <p className="text-muted-foreground">Traffic chart visualization would go here</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-center gap-4">
                      <div className="w-12 text-center font-bold text-muted-foreground">{post.views}</div>
                      <div className="flex-1 truncate">
                        <Link href={`/post/${post.id}`} className="font-medium hover:text-cyan-400">
                          {post.title}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      alt="User avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Sarah Johnson</span>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Great article! I especially liked the section on quantum-resistant algorithms.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      alt="User avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Michael Chen</span>
                        <span className="text-xs text-muted-foreground">5 hours ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Have you considered covering the recent developments in post-quantum cryptography?
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                <Button variant="outline">Filter</Button>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b px-4 py-3 font-medium">
                  <div className="col-span-6">Title</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-center">Date</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>

                {posts.map((post) => (
                  <div key={post.id} className="grid grid-cols-12 items-center border-b px-4 py-3 last:border-0">
                    <div className="col-span-6 truncate font-medium">
                      <Link href={`/post/${post.id}`} className="hover:text-cyan-400">
                        {post.title}
                      </Link>
                    </div>
                    <div className="col-span-2 text-center">
                      <Badge variant={post.status === "published" ? "default" : "outline"}>{post.status}</Badge>
                    </div>
                    <div className="col-span-2 text-center text-sm text-muted-foreground">{post.date}</div>
                    <div className="col-span-2 flex justify-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                <p className="text-muted-foreground">Comments management interface would go here</p>
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
                <Textarea
                  id="blog-description"
                  defaultValue="Exploring cybersecurity, technology, and computer science."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="meta-keywords" className="text-sm font-medium">
                  Meta Keywords
                </label>
                <Input id="meta-keywords" defaultValue="cybersecurity, tech, programming, computer science" />
                <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
              </div>

              <Button className="bg-cyan-600 hover:bg-cyan-700">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
