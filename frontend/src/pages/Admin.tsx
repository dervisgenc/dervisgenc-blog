import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff, Edit, BarChart2, Plus } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/Modal';
import axios from 'axios';
import { useAuth } from '@/components/context/AuthContext';
import { useDarkMode } from '@/components/context/DarkModeContext';
import { getAuthHeaders } from '@/utils/auth';

interface Post {
    id: string;
    title: string;
    summary: string;
    content: string;
    created_at: string;
    updated_at: string;
    read_time: number;
    image_url: string;
    is_active: boolean;
}

export default function AdminPage() {
    const { isDarkMode } = useDarkMode();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<string | null>(null);
    const { token } = useAuth();
    const navigate = useNavigate();

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'delete' | 'hide' | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    // Backend'den postları çekme
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                const headers = getAuthHeaders();
                const response = await axios.get('http://localhost:8080/admin/posts', {
                    headers: headers
                });
                setPosts(response.data);
                setIsLoading(false);
            } catch (error: any) {
                if (error.response?.status === 401) {
                    navigate('/admin/login');
                    return;
                }
                setIsError('Failed to fetch posts');
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [navigate]);

    const handleEdit = (post: Post) => {
        navigate(`/sentinel/edit/${post.id}`);
    };

    const handleDelete = (id: string) => {
        setConfirmAction('delete');
        setSelectedPostId(id);
        setIsConfirmModalOpen(true);
    };

    const handleToggleHide = async (id: string) => {
        setConfirmAction('hide');
        setSelectedPostId(id);
        setIsConfirmModalOpen(true);
    };

    const confirmActionHandler = async () => {
        if (selectedPostId && confirmAction === 'hide') {
            const postToUpdate = posts.find(post => post.id === selectedPostId);
            if (!postToUpdate) return;

            try {
                const formData = new FormData();
                formData.append('title', postToUpdate.title);
                formData.append('description', postToUpdate.summary);
                formData.append('content', postToUpdate.content);
                formData.append('readTime', postToUpdate.read_time.toString());
                formData.append('isActive', (!postToUpdate.is_active).toString()); // Toggle the current state

                await axios.put(`http://localhost:8080/admin/posts/${selectedPostId}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                });

                // Update local state
                setPosts(posts.map(post =>
                    post.id === selectedPostId
                        ? { ...post, is_active: !post.is_active }
                        : post
                ));
            } catch (error) {
                console.error('Failed to update post visibility:', error);
                setIsError('Failed to update post visibility');
            }
        } else if (selectedPostId && confirmAction === 'delete') {
            try {
                await axios.delete(`http://localhost:8080/admin/posts/${selectedPostId}/permanent`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setPosts(posts.filter(post => post.id !== selectedPostId));
            } catch (error) {
                setIsError('Failed to delete post');
            }
        }
        setIsConfirmModalOpen(false);
        setSelectedPostId(null);
        setConfirmAction(null);
    };

    const cancelActionHandler = () => {
        setIsConfirmModalOpen(false);
        setSelectedPostId(null);
        setConfirmAction(null);
    };

    const handleAdd = () => {
        navigate('/sentinel/add');
    };

    return (
        <div
            className={`min-h-screen py-8 px-4 md:px-8 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}
        >
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-2">
                CyberTron Admin
            </h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : isError ? (
                <p className="text-red-500">{isError}</p>
            ) : (
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={handleAdd}
                        className={`mb-6 px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center ${isDarkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                            }`}
                    >
                        <Plus size={20} className="mr-2" />
                        Add New Post
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className={`p-6 rounded-lg shadow-lg relative ${!post.is_active ? 'opacity-60' : ''
                                    } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                            >
                                {!post.is_active && (
                                    <span
                                        className={`absolute top-4 left-4 text-white px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-red-600' : 'bg-red-500'
                                            }`}
                                    >
                                        Hidden
                                    </span>
                                )}
                                <h2
                                    className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                        }`}
                                >
                                    {post.title}
                                </h2>
                                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {post.summary}
                                </p>
                                <div
                                    className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                >
                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    <span>{post.read_time} min read</span>
                                </div>
                                <div className="flex space-x-2 mt-4">
                                    <button
                                        onClick={() => handleToggleHide(post.id)}
                                        className={`p-2 rounded hover:bg-yellow-700 transition-colors ${isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'
                                            }`}
                                    >
                                        {post.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className={`p-2 rounded hover:bg-blue-700 transition-colors ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                            }`}
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className={`p-2 rounded hover:bg-red-700 transition-colors ${isDarkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
                                            }`}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/sentinel/stats/${post.id}`)}
                                        className={`p-2 rounded hover:bg-purple-700 transition-colors ${isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                                            }`}
                                    >
                                        <BarChart2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title={confirmAction === 'delete' ? 'Delete Post' : 'Toggle Post Visibility'}
                message={confirmAction === 'delete'
                    ? 'Are you sure you want to delete this post? This action cannot be undone.'
                    : 'Are you sure you want to hide/show this post?'}
                onConfirm={confirmActionHandler}
                onCancel={cancelActionHandler}
            />
        </div>
    );
}
