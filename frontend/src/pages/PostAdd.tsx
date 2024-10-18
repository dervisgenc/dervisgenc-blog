import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import '../quill-custom.css';
import axios from 'axios';

// Export the PostAddPage component
export default function PostAddPage() {
    const [newPost, setNewPost] = useState({
        title: '',
        description: '',
        content: '',
        imageFile: null as File | null, // Resim dosyasını burada tutacağız
        readTime: '',
        hidden: true,  // Can be saved as a draft initially
    });
    const navigate = useNavigate();
    const [content, setContent] = useState('');

    // Blog gönderisi ve görseli birlikte backend'e gönderme fonksiyonu
    const handleSubmit = async (isDraft: boolean) => {
        const formData = new FormData();

        // Post verilerini formData'ya ekle
        formData.append('title', newPost.title);
        formData.append('description', newPost.description);
        formData.append('content', content);  // Quill'den alınan content
        formData.append('readTime', newPost.readTime);
        formData.append('hidden', JSON.stringify(isDraft));  // Taslak olarak mı kaydediliyor?

        // Kapak görselini formData'ya ekle
        if (newPost.imageFile) {
            formData.append('image', newPost.imageFile);
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/admin/posts', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Post saved');
            navigate('/sentinel');
        } catch (err) {
            console.error('Error saving post:', err);
        }
    };

    // Yayınlama ve taslak kaydetme fonksiyonları
    const handleSaveDraft = () => handleSubmit(true);
    const handlePublish = () => handleSubmit(false);

    // İptal etme fonksiyonu
    const handleCancel = () => {
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

                {/* Kapak görseli yükleme inputu */}
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setNewPost({ ...newPost, imageFile: e.target.files![0] })}
                    className="mb-4"
                />

                {/* Quill Editor */}
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={{
                        toolbar: [['bold', 'italic', 'underline', 'image']],
                    }}
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
