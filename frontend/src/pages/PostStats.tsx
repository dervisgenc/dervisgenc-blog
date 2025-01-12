import React from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Eye, ThumbsUp, Share2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDarkMode } from '@/components/context/DarkModeContext'
import { useParams, useNavigate } from 'react-router-dom';
import { usePostStats } from '@/hooks/useStats';
import { format } from 'date-fns';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; isDarkMode: boolean }> =
    ({ title, value, icon, isDarkMode }) => (
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {value.toLocaleString()}
                </div>
            </CardContent>
        </Card>
    )

export default function PostStats() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isDarkMode } = useDarkMode();
    const { stats, loading, error } = usePostStats(Number(id));

    if (loading) return <div>Loading...</div>;
    if (error) {
        if (error.includes('Unauthorized')) {
            React.useEffect(() => {
                navigate('/admin/login');
            }, [navigate]);
            return <div>Redirecting to login...</div>;
        }
        return <div>Error: {error}</div>;
    }
    if (!stats) return <div>No stats available</div>;

    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
            <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
                {stats.title}
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <StatCard
                    title="Total Views"
                    value={stats.views}
                    icon={<Eye className="h-4 w-4 text-purple-400" />}
                    isDarkMode={isDarkMode}
                />
                <StatCard
                    title="Total Likes"
                    value={stats.likes}
                    icon={<ThumbsUp className="h-4 w-4 text-purple-400" />}
                    isDarkMode={isDarkMode}
                />
                <StatCard
                    title="Total Shares"
                    value={stats.shares}
                    icon={<Share2 className="h-4 w-4 text-purple-400" />}
                    isDarkMode={isDarkMode}
                />

            </div>

            <Card className={`mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                    <CardTitle className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
                        Monthly Performance
                    </CardTitle>
                    <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Views, likes, and shares per month
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.monthly_stats}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={isDarkMode ? '#4B5563' : '#E5E7EB'}
                            />
                            <XAxis
                                dataKey="month"
                                stroke={isDarkMode ? '#9CA3AF' : '#4B5563'}
                            />
                            <YAxis
                                stroke={isDarkMode ? '#9CA3AF' : '#4B5563'}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                    border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                                    borderRadius: '4px'
                                }}
                                itemStyle={{
                                    color: isDarkMode ? '#E5E7EB' : '#1F2937'
                                }}
                                labelStyle={{
                                    color: isDarkMode ? '#9CA3AF' : '#4B5563'
                                }}
                            />
                            <Legend
                                wrapperStyle={{
                                    color: isDarkMode ? '#9CA3AF' : '#4B5563'
                                }}
                            />
                            <Line type="monotone" dataKey="views" stroke="#8B5CF6" name="Views" />
                            <Line type="monotone" dataKey="likes" stroke="#EC4899" name="Likes" />
                            <Line type="monotone" dataKey="shares" stroke="#EF4444" name="Shares" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                    <CardTitle className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
                        Post Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`grid grid-cols-2 gap-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div>
                            <p className="font-semibold">Publish Date:</p>
                            <p>{format(new Date(stats.created_at), 'MMMM dd, yyyy')}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Average Read Time:</p>
                            <p>{stats.read_time} minutes</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}