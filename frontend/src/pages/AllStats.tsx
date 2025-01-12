import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Eye, ThumbsUp, Share2, ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDarkMode } from '@/components/context/DarkModeContext'
import { useDetailedStats } from '@/hooks/useStats';
import { PostDetailedStats } from '@/types'
import { useNavigate } from 'react-router-dom';


const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; isDarkMode: boolean }> =
    ({ title, value, icon, isDarkMode }) => (
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>{value.toLocaleString()}</div>
            </CardContent>
        </Card>
    )

export default function AllPostsStats() {
    const navigate = useNavigate();
    const { isDarkMode } = useDarkMode();
    const [sortConfig, setSortConfig] = useState<{ key: keyof PostDetailedStats; direction: 'asc' | 'desc' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { stats, loading, error } = useDetailedStats();

    const filteredPosts = React.useMemo(() => {
        if (!stats?.post_stats) return [];

        let posts = [...stats.post_stats];
        if (searchTerm) {
            posts = posts.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sortConfig) {
            posts.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return posts;
    }, [stats, searchTerm, sortConfig]);

    if (loading) return <div>Loading...</div>;
    if (error) {
        if (error.includes('Unauthorized')) {
            // Redirect to login page if unauthorized
            React.useEffect(() => {
                navigate('/admin/login');
            }, [navigate]);
            return <div>Redirecting to login...</div>;
        }
        return <div>Error: {error}</div>;
    }
    if (!stats) return <div>No stats available</div>;

    const requestSort = (key: keyof PostDetailedStats) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
            }`}>
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-2">
                Blog Statistics
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <StatCard
                    title="Total Views"
                    value={stats?.total_stats.total_views || 0}
                    icon={<Eye className="h-4 w-4 text-purple-400" />}
                    isDarkMode={isDarkMode}
                />
                <StatCard
                    title="Total Likes"
                    value={stats?.total_stats.total_likes || 0}
                    icon={<ThumbsUp className="h-4 w-4 text-purple-400" />}
                    isDarkMode={isDarkMode}
                />
                <StatCard
                    title="Total Shares"
                    value={stats?.total_stats.total_shares || 0}
                    icon={<Share2 className="h-4 w-4 text-purple-400" />}
                    isDarkMode={isDarkMode}
                />
            </div>

            <Card className={`mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                    <CardTitle className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>Post Performance Comparison</CardTitle>
                    <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Views, likes, and shares per post</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={filteredPosts}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
                            <XAxis dataKey="title" angle={-45} textAnchor="end" interval={0} height={120} stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                            <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                    border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                                    borderRadius: '4px'
                                }}
                                itemStyle={{ color: isDarkMode ? '#E5E7EB' : '#1F2937' }}
                                labelStyle={{ color: isDarkMode ? '#9CA3AF' : '#4B5563' }}
                            />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: '20px',
                                    color: isDarkMode ? '#9CA3AF' : '#4B5563'
                                }}
                                verticalAlign="bottom"
                                height={60}
                            />
                            <Bar dataKey="views" fill="#8B5CF6" name="Views" />
                            <Bar dataKey="likes" fill="#EC4899" name="Likes" />
                            <Bar dataKey="shares" fill="#EF4444" name="Shares" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                    <CardTitle className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>Detailed Post Statistics</CardTitle>
                    <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
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
                            className={`${isDarkMode
                                ? 'bg-gray-700 text-gray-100 border-gray-600 focus:border-purple-500'
                                : 'bg-white text-gray-900 border-gray-200 focus:border-purple-500'}`}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                                <TableHead className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    <Button variant="ghost" onClick={() => requestSort('title')}
                                        className={isDarkMode ? 'hover:text-white' : 'hover:text-black'}>
                                        Title <ArrowUpDown size={16} />
                                    </Button>
                                </TableHead>
                                <TableHead className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    <Button variant="ghost" onClick={() => requestSort('views')}
                                        className={isDarkMode ? 'hover:text-white' : 'hover:text-black'}>
                                        Views <ArrowUpDown size={16} />
                                    </Button>
                                </TableHead>
                                <TableHead className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    <Button variant="ghost" onClick={() => requestSort('likes')}
                                        className={isDarkMode ? 'hover:text-white' : 'hover:text-black'}>
                                        Likes <ArrowUpDown size={16} />
                                    </Button>
                                </TableHead>
                                <TableHead className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    <Button variant="ghost" onClick={() => requestSort('shares')}
                                        className={isDarkMode ? 'hover:text-white' : 'hover:text-black'}>
                                        Shares <ArrowUpDown size={16} />
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPosts.map((post) => (
                                <TableRow key={post.post_id} className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                                    <TableCell className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                        }`}>{post.title}</TableCell>
                                    <TableCell className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                        {post.views.toLocaleString()}
                                    </TableCell>
                                    <TableCell className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                        {post.likes.toLocaleString()}
                                    </TableCell>
                                    <TableCell className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                        {post.shares.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}