import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import '../quill-custom.css';

export default function PostAddPage() {
    const [newPost, setNewPost] = useState({
        title: '',
        description: '',
        content: '',
        image: '/placeholder.svg?height=200&width=400',
        readTime: '',
        hidden: true,  // Can be saved as a draft initially
    });
    const navigate = useNavigate();

    const handleSaveDraft = () => {
        // Save the post as a draft
        console.log('Draft saved:', newPost);
        // Return to the admin page after saving the draft
        navigate('/sentinel');
    };

    const handlePublish = () => {
        // Publish the post (hidden: false should be set)
        const postToPublish = { ...newPost, hidden: false };
        console.log('Published:', postToPublish);
        // Return to the admin page after publishing
        navigate('/sentinel');
    };

    const handleCancel = () => {
        // Return to the admin page
        navigate('/sentinel');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                Add New Post
            </h1>
            <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
                <input
                    type="text"
                    value={newPost.title}
                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                    placeholder="Title"
                />
                <textarea
                    value={newPost.description}
                    onChange={e => setNewPost({ ...newPost, description: e.target.value })}
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                    placeholder="Description"
                    rows={3}
                />
                <ReactQuill
                    theme="snow"
                    value={newPost.content}
                    onChange={content => setNewPost({ ...newPost, content })}
                    className="quill-editor"
                />
                <input
                    type="text"
                    value={newPost.readTime}
                    onChange={e => setNewPost({ ...newPost, readTime: e.target.value })}
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                    placeholder="Read Time"
                />
                <div className="flex justify-between space-x-4">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <div className="flex space-x-4">
                        <button
                            onClick={handleSaveDraft}
                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                        >
                            Save as Draft
                        </button>
                        <button
                            onClick={handlePublish}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                            Publish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
