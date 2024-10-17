import { useState } from 'react';
import { Trash2, Eye, EyeOff, Edit, BarChart2, Plus } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/Modal';

interface Post {
    id: string;
    title: string;
    description: string;
    content: string;
    date: string;
    readTime: string;
    image: string;
    hidden: boolean;
}

const initialPosts: Post[] = [
    {
        id: '1',
        title: "Hacking Techniques: A Deep Dive",
        description: "Explore the latest hacking techniques and how to protect against them in this comprehensive guide.",
        content: "<p>This is some detailed content for the hacking guide.</p>",
        date: "May 15, 2023",
        readTime: "5 min read",
        image: "/placeholder.svg?height=200&width=400",
        hidden: false,
    },
    {
        id: '2',
        title: "Cybersecurity Trends 2023",
        description: "Stay ahead of the curve with our analysis of the top cybersecurity trends for 2023.",
        content: "<p>This is the latest trends in cybersecurity.</p>",
        date: "May 20, 2023",
        readTime: "7 min read",
        image: "/placeholder.svg?height=200&width=400",
        hidden: false,
    },
    {
        id: '3',
        title: "AI in Cybersecurity",
        description: "Discover how artificial intelligence is revolutionizing the cybersecurity landscape.",
        content: "<p>This is content for AI in cybersecurity.</p>",
        date: "May 25, 2023",
        readTime: "6 min read",
        image: "/placeholder.svg?height=200&width=400",
        hidden: true,
    },
];

interface AdminPageProps {
    isDarkMode: boolean;
}

export default function AdminPage({ isDarkMode }: AdminPageProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [editingPost] = useState<Post | null>(null);
    const navigate = useNavigate();

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'delete' | 'hide' | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    const handleEdit = (post: Post) => {
        navigate(`/edit/${post.id}`);
    };

    const handleDelete = (id: string) => {
        setConfirmAction('delete');
        setSelectedPostId(id);
        setIsConfirmModalOpen(true);
    };

    const handleToggleHide = (id: string) => {
        setConfirmAction('hide');
        setSelectedPostId(id);
        setIsConfirmModalOpen(true);
    };

    const confirmActionHandler = () => {
        if (selectedPostId && confirmAction) {
            if (confirmAction === 'delete') {
                setPosts(posts.filter((post) => post.id !== selectedPostId));
            } else if (confirmAction === 'hide') {
                setPosts(
                    posts.map((post) =>
                        post.id === selectedPostId ? { ...post, hidden: !post.hidden } : post
                    )
                );
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
        navigate('/add');
    };

    return (
        <div
            className={`min-h-screen py-8 px-4 md:px-8 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}
        >
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-2">
                CyberTron Admin
            </h1>
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
                            className={`p-6 rounded-lg shadow-lg relative ${post.hidden ? 'opacity-60' : ''
                                } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                        >
                            {/* Hidden post label */}
                            {post.hidden && (
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
                                {post.description}
                            </p>
                            <div
                                className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                            >
                                <span>{post.date}</span>
                                <span>{post.readTime}</span>
                            </div>
                            <div className="flex space-x-2 mt-4">
                                <button
                                    onClick={() => handleToggleHide(post.id)}
                                    className={`p-2 rounded hover:bg-yellow-700 transition-colors ${isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'
                                        }`}
                                >
                                    {post.hidden ? <EyeOff size={20} /> : <Eye size={20} />}
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

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title={
                    confirmAction === 'delete' ? 'Delete Post' : 'Toggle Post Visibility'
                }
                message={
                    confirmAction === 'delete'
                        ? 'Are you sure you want to delete this post? This action cannot be undone.'
                        : 'Are you sure you want to hide/show this post?'
                }
                onConfirm={confirmActionHandler}
                onCancel={cancelActionHandler}
            />

            {editingPost && (
                // Your existing edit modal can stay here
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    {/* ... */}
                </div>
            )}
        </div>
    );
}
