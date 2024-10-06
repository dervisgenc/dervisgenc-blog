import { useState } from 'react'
import { Trash2, Eye, EyeOff, Edit, BarChart2, Plus } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useNavigate } from 'react-router-dom'

interface Post {
    id: string
    title: string
    description: string
    content: string // İçerik için yeni bir alan ekledik
    date: string
    readTime: string
    image: string
    hidden: boolean
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
        hidden: false
    },
    {
        id: '2',
        title: "Cybersecurity Trends 2023",
        description: "Stay ahead of the curve with our analysis of the top cybersecurity trends for 2023.",
        content: "<p>This is the latest trends in cybersecurity.</p>",
        date: "May 20, 2023",
        readTime: "7 min read",
        image: "/placeholder.svg?height=200&width=400",
        hidden: false
    },
    {
        id: '3',
        title: "AI in Cybersecurity",
        description: "Discover how artificial intelligence is revolutionizing the cybersecurity landscape.",
        content: "<p>This is content for AI in cybersecurity.</p>",
        date: "May 25, 2023",
        readTime: "6 min read",
        image: "/placeholder.svg?height=200&width=400",
        hidden: true
    }
]

export default function AdminPage() {
    const [posts, setPosts] = useState<Post[]>(initialPosts)
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const navigate = useNavigate();  // navigate fonksiyonunu alıyoruz

    const handleEdit = (post: Post) => {
        navigate(`/edit/${post.id}`);  // Düzenleme sayfasına yönlendirme
    };

    const handleDelete = (id: string) => {
        setPosts(posts.filter(post => post.id !== id))
    }

    const handleToggleHide = (id: string) => {
        setPosts(posts.map(post =>
            post.id === id ? { ...post, hidden: !post.hidden } : post
        ))
    }

    const handleUpdate = (updatedPost: Post) => {
        setPosts(posts.map(post =>
            post.id === updatedPost.id ? updatedPost : post
        ))
        setEditingPost(null)
    }

    const handleAdd = () => {
        navigate('/add');
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                CyberNexus Admin
            </h1>
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={handleAdd}
                    className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    Add New Post
                </button>
                <div className="space-y-6">
                    {posts.map(post => (
                        <div key={post.id} className="bg-gray-800 p-6 rounded-lg shadow-lg relative">
                            <h2 className="text-2xl font-semibold mb-2 text-purple-400">{post.title}</h2>
                            <p className="text-gray-300 mb-4">{post.description}</p>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>{post.date}</span>
                                <span>{post.readTime}</span>
                            </div>
                            <div className="absolute top-4 right-4 space-x-2">
                                <button
                                    onClick={() => handleToggleHide(post.id)}
                                    className="p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                                >
                                    {post.hidden ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                                <button
                                    onClick={() => handleEdit(post)}
                                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button
                                    onClick={() => alert(`Redirecting to statistics for post: ${post.id}`)}
                                    className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                >
                                    <BarChart2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {editingPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl font-semibold mb-4 text-purple-400">
                            {editingPost.id === posts[posts.length - 1].id ? 'Add New Post' : 'Edit Post'}
                        </h2>
                        <input
                            type="text"
                            value={editingPost.title}
                            onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                            placeholder="Title"
                        />
                        <textarea
                            value={editingPost.description}
                            onChange={e => setEditingPost({ ...editingPost, description: e.target.value })}
                            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                            placeholder="Description"
                            rows={2}
                        />
                        {/* React Quill ile içerik editörü */}
                        <ReactQuill
                            theme="snow"
                            value={editingPost.content}
                            onChange={content => setEditingPost({ ...editingPost, content })}
                            className="bg-gray-700 text-white mb-4"
                        />
                        <input
                            type="text"
                            value={editingPost.readTime}
                            onChange={e => setEditingPost({ ...editingPost, readTime: e.target.value })}
                            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                            placeholder="Read Time"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setEditingPost(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdate(editingPost)}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
