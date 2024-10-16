import React from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Eye, ThumbsUp, Share2, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

interface PostStat {
    date: string
    views: number
    likes: number
    shares: number
    comments: number
}

interface BlogPost {
    id: number
    title: string
    description: string
    publishDate: string
    avgReadTime: number
    stats: PostStat[]
}

const blogPost: BlogPost = {
    id: 1,
    title: "Hacking Techniques: A Deep Dive",
    description: "Explore the latest hacking techniques and how to protect against them in this comprehensive guide.",
    publishDate: "2024-03-15",
    avgReadTime: 7,
    stats: [
        { date: '2024-03-15', views: 1000, likes: 150, shares: 50, comments: 20 },
        { date: '2024-03-16', views: 1500, likes: 220, shares: 75, comments: 30 },
        { date: '2024-03-17', views: 2000, likes: 300, shares: 100, comments: 40 },
        { date: '2024-03-18', views: 2500, likes: 380, shares: 125, comments: 50 },
        { date: '2024-03-19', views: 3000, likes: 450, shares: 150, comments: 60 },
    ]
}

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

export default function PostStats() {
    const totalViews = blogPost.stats.reduce((sum, day) => sum + day.views, 0)
    const totalLikes = blogPost.stats.reduce((sum, day) => sum + day.likes, 0)
    const totalShares = blogPost.stats.reduce((sum, day) => sum + day.shares, 0)
    const totalComments = blogPost.stats.reduce((sum, day) => sum + day.comments, 0)

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 p-8">
            <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                {blogPost.title}
            </h1>
            <p className="text-center text-gray-400 mb-8">{blogPost.description}</p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard title="Total Views" value={totalViews} icon={<Eye className="h-4 w-4 text-purple-400" />} />
                <StatCard title="Total Likes" value={totalLikes} icon={<ThumbsUp className="h-4 w-4 text-purple-400" />} />
                <StatCard title="Total Shares" value={totalShares} icon={<Share2 className="h-4 w-4 text-purple-400" />} />
                <StatCard title="Total Comments" value={totalComments} icon={<MessageCircle className="h-4 w-4 text-purple-400" />} />
            </div>

            <Card className="mb-8 bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-gray-100">Engagement Over Time</CardTitle>
                    <CardDescription className="text-gray-400">Views, likes, shares, and comments per day</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={blogPost.stats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '4px' }}
                                itemStyle={{ color: '#E5E7EB' }}
                                labelStyle={{ color: '#9CA3AF' }}
                            />
                            <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                            <Line type="monotone" dataKey="views" stroke="#8B5CF6" name="Views" />
                            <Line type="monotone" dataKey="likes" stroke="#EC4899" name="Likes" />
                            <Line type="monotone" dataKey="shares" stroke="#EF4444" name="Shares" />
                            <Line type="monotone" dataKey="comments" stroke="#10B981" name="Comments" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-gray-100">Post Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                        <div>
                            <p className="font-semibold">Publish Date:</p>
                            <p>{blogPost.publishDate}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Average Read Time:</p>
                            <p>{blogPost.avgReadTime} minutes</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}