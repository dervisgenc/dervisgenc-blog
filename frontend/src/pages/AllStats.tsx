import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Eye, ThumbsUp, Share2, MessageCircle, ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface BlogPost {
    id: number
    title: string
    views: number
    likes: number
    shares: number
    comments: number
    avgReadTime: number
}

const blogPosts: BlogPost[] = [
    { id: 1, title: "Hacking Techniques: A Deep Dive", views: 15000, likes: 2300, shares: 500, comments: 150, avgReadTime: 7 },
    { id: 2, title: "Cybersecurity Trends 2024", views: 12000, likes: 1800, shares: 400, comments: 120, avgReadTime: 5 },
    { id: 3, title: "AI in Cybersecurity", views: 18000, likes: 2700, shares: 600, comments: 200, avgReadTime: 8 },
    { id: 4, title: "Blockchain and Security", views: 10000, likes: 1500, shares: 300, comments: 100, avgReadTime: 6 },
    { id: 5, title: "The Future of Encryption", views: 13000, likes: 2000, shares: 450, comments: 130, avgReadTime: 7 },
]

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-gray-100">{value.toLocaleString()}</div>
        </CardContent>
    </Card>
)

export default function AllPostsStats() {
    const [sortConfig, setSortConfig] = useState<{ key: keyof BlogPost; direction: 'asc' | 'desc' } | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const sortedPosts = React.useMemo(() => {
        let sortablePosts = [...blogPosts]
        if (sortConfig !== null) {
            sortablePosts.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1
                }
                return 0
            })
        }
        return sortablePosts
    }, [sortConfig])

    const filteredPosts = sortedPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalViews = blogPosts.reduce((sum, post) => sum + post.views, 0)
    const totalLikes = blogPosts.reduce((sum, post) => sum + post.likes, 0)
    const totalShares = blogPosts.reduce((sum, post) => sum + post.shares, 0)
    const totalComments = blogPosts.reduce((sum, post) => sum + post.comments, 0)

    const requestSort = (key: keyof BlogPost) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 p-8">
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-2">
                CyberTron Blog Statistics
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard title="Total Views" value={totalViews} icon={<Eye className="h-4 w-4 text-purple-400" />} />
                <StatCard title="Total Likes" value={totalLikes} icon={<ThumbsUp className="h-4 w-4 text-purple-400" />} />
                <StatCard title="Total Shares" value={totalShares} icon={<Share2 className="h-4 w-4 text-purple-400" />} />
                <StatCard title="Total Comments" value={totalComments} icon={<MessageCircle className="h-4 w-4 text-purple-400" />} />
            </div>

            <Card className="mb-8 bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-gray-100">Post Performance Comparison</CardTitle>
                    <CardDescription className="text-gray-400">Views, likes, shares, and comments per post</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={blogPosts}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                            <XAxis dataKey="title" angle={-45} textAnchor="end" interval={0} height={120} stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '4px' }}
                                itemStyle={{ color: '#E5E7EB' }}
                                labelStyle={{ color: '#9CA3AF' }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                verticalAlign="bottom"
                                height={60}
                            />
                            <Bar dataKey="views" fill="#8B5CF6" name="Views" />
                            <Bar dataKey="likes" fill="#EC4899" name="Likes" />
                            <Bar dataKey="shares" fill="#EF4444" name="Shares" />
                            <Bar dataKey="comments" fill="#10B981" name="Comments" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-gray-100">Detailed Post Statistics</CardTitle>
                    <CardDescription className="text-gray-400">
                        Click on column headers to sort. Use the search box to filter posts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            type="text"
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-700 text-gray-100 border-gray-600 focus:border-purple-500"
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-700">
                                <TableHead className="text-gray-300">
                                    <Button variant="ghost" onClick={() => requestSort('title')}>
                                        Title <ArrowUpDown size={16} />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-gray-300">
                                    <Button variant="ghost" onClick={() => requestSort('views')}>
                                        Views <ArrowUpDown size={16} />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-gray-300">
                                    <Button variant="ghost" onClick={() => requestSort('likes')}>
                                        Likes <ArrowUpDown size={16} />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-gray-300">
                                    <Button variant="ghost" onClick={() => requestSort('shares')}>
                                        Shares <ArrowUpDown size={16} />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-gray-300">
                                    <Button variant="ghost" onClick={() => requestSort('comments')}>
                                        Comments <ArrowUpDown size={16} />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-gray-300">
                                    <Button variant="ghost" onClick={() => requestSort('avgReadTime')}>
                                        Avg. Read Time <ArrowUpDown size={16} />
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPosts.map((post) => (
                                <TableRow key={post.id} className="border-gray-700">
                                    <TableCell className="font-medium text-gray-300">{post.title}</TableCell>
                                    <TableCell className="text-gray-400">{post.views.toLocaleString()}</TableCell>
                                    <TableCell className="text-gray-400">{post.likes.toLocaleString()}</TableCell>
                                    <TableCell className="text-gray-400">{post.shares.toLocaleString()}</TableCell>
                                    <TableCell className="text-gray-400">{post.comments.toLocaleString()}</TableCell>
                                    <TableCell className="text-gray-400">{post.avgReadTime} min</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}