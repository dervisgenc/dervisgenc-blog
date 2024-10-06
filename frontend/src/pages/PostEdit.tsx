import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useState } from 'react';
import '../quill-custom.css';

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
    }
];

// Custom toolbar options for the Quill editor
const modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['bold', 'italic', 'underline', 'blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'align': [] }],
        ['clean']  // Removes formatting
    ],
};

// Allowing specific formats from the Quill documentation
const formats = [
    'header', 'font', 'bold', 'italic', 'underline', 'list', 'bullet',
    'blockquote', 'code-block', 'link', 'image', 'align'
];

export default function PostEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const post = initialPosts.find(p => p.id === id);
    const [editingPost, setEditingPost] = useState<Post | null>(post || null);

    if (!editingPost) return <p>Post not found</p>;

    const handleSave = () => {
        console.log('Updated post:', editingPost);
        navigate('/');  // Admin sayfasına dön
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                Edit Post
            </h1>
            <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
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
                    rows={3}
                />
                <ReactQuill
                    theme="snow"
                    value={editingPost.content}
                    onChange={content => setEditingPost({ ...editingPost, content })}
                    modules={modules}
                    formats={formats}
                    className="quill-editor"
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
                        onClick={() => navigate('/sentinel')}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
