import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/components/context/AuthContext';
import '../quill-custom.css';

interface Post {
    id: string;
    title: string;
    summary: string;
    content: string;
    created_at: string;
    read_time: number;
    image_url: string;
    is_active: boolean;
}

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
    const { token } = useAuth();

    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [initialPost, setInitialPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Postu backend'den çekme
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/admin/posts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Gelen post verilerini hem `initialPost` hem de `editingPost`'a atıyoruz
                const postData = response.data;
                setInitialPost(postData);
                setEditingPost(postData); // Tüm alanların aynı olmasını sağlıyoruz
                setIsLoading(false);
            } catch (err) {
                setError('Failed to fetch post');
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [id, token]);


    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!editingPost) return <p>Post not found</p>;

    // Kapak resmi değiştirme işlemi
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewImage(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        try {
            const postUpdateData: Partial<Post> = {
                id: editingPost?.id || initialPost?.id,  // ID'yi koruyoruz
                is_active: initialPost?.is_active,
                created_at: initialPost?.created_at,
                image_url: initialPost?.image_url,
                title: editingPost?.title !== initialPost?.title ? editingPost?.title : initialPost?.title,
                summary: editingPost?.summary !== initialPost?.summary ? editingPost?.summary : initialPost?.summary,
                content: editingPost?.content !== initialPost?.content ? editingPost?.content : initialPost?.content,
                read_time: editingPost?.read_time !== initialPost?.read_time ? editingPost?.read_time : initialPost?.read_time,
            };

            // Eğer herhangi bir değişiklik varsa gönder
            if (Object.keys(postUpdateData).length > 0) {
                await axios.put(`http://localhost:8080/admin/posts/${editingPost?.id}`, postUpdateData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            // Yeni kapak resmi seçildiyse onu da yükle
            if (newImage) {
                const formData = new FormData();
                formData.append('image', newImage);

                const uploadResponse = await axios.post(`http://localhost:8080/admin/upload`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Yüklenen yeni resmin URL'sini güncelle
                const updatedPost = {
                    ...editingPost,
                    image_url: uploadResponse.data.imageUrl,
                };

                await axios.put(`http://localhost:8080/admin/posts/${editingPost?.id}`, updatedPost, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            navigate('/sentinel'); // Admin sayfasına dön
        } catch (err) {
            console.error('Failed to update post', err);
        }
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
                    value={editingPost.summary}
                    onChange={e => setEditingPost({ ...editingPost, summary: e.target.value })}
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                    placeholder="summary"
                    rows={5}
                />
                <ReactQuill
                    theme="snow"
                    value={editingPost.content}
                    onChange={content => setEditingPost({ ...editingPost, content })}
                    modules={modules}
                    formats={formats}
                    className="quill-editor mb-4"
                />
                <input
                    type="number"
                    value={editingPost.read_time}
                    onChange={e => setEditingPost({ ...editingPost, read_time: parseInt(e.target.value) })}
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                    placeholder="Read Time"
                />

                {/* Kapak Resmi Yükleme */}
                <div className="mb-4">
                    <label className="block text-white mb-2">Change Cover Image</label>
                    <input type="file" onChange={handleImageChange} className="w-full p-2 bg-gray-700 text-white rounded" />
                </div>

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
