// PostEditPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/components/context/AuthContext';
import '../quill-custom.css';
import { useDarkMode } from '@/components/context/DarkModeContext';
import { PostDetail } from '@/types';
import { quillModules, quillFormats } from '@/utils/quillConfig';
import { toast } from 'react-hot-toast';

export default function PostEditPage() {
    const { isDarkMode } = useDarkMode();
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [editingPost, setEditingPost] = useState<PostDetail | null>(null);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [initialPost, setInitialPost] = useState<PostDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Fetch the post from backend
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`https://blog.dervisgenc.com/api/admin/posts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const postData = response.data;
                setInitialPost(postData);
                setEditingPost(postData); // Ensure all fields are the same
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    navigate('/404', { replace: true });
                } else {
                    setError('Failed to fetch post');
                    toast.error('Failed to load post');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [id, token, navigate]);

    useEffect(() => {
        if (initialPost && editingPost) {
            const hasChanges = JSON.stringify(initialPost) !== JSON.stringify(editingPost) || newImage !== null;
            setHasUnsavedChanges(hasChanges);
        }
    }, [initialPost, editingPost, newImage]);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!editingPost) return <p>Post not found</p>;

    // Handle image change
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewImage(e.target.files[0]);
        }
    };

    const validateForm = () => {
        if (!editingPost) return false;

        if (!editingPost.title.trim()) {
            toast.error('Title is required');
            return false;
        }
        if (!editingPost.content.trim()) {
            toast.error('Content is required');
            return false;
        }
        if (!editingPost.summary.trim()) {
            toast.error('Summary is required');
            return false;
        }
        if (editingPost.read_time <= 0) {
            toast.error('Read time must be positive');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!editingPost || !initialPost) return;
        if (!validateForm()) return;

        setIsSaving(true);
        const previousPost = { ...editingPost };

        // Create optimistic update
        const optimisticPost = {
            ...editingPost,
            updated_at: new Date().toISOString()
        };
        setEditingPost(optimisticPost);

        try {
            const formData = new FormData();

            // Add all post data to formData
            formData.append('title', editingPost.title);
            formData.append('description', editingPost.summary);
            formData.append('content', editingPost.content);
            formData.append('readTime', editingPost.read_time.toString());
            formData.append('isActive', editingPost.is_active.toString());

            // If there's a new image, add it to formData
            if (newImage) {
                formData.append('image', newImage);
            } else {
                formData.append('image_url', initialPost.image_url);
            }

            const savePromise = axios.put(
                `https://blog.dervisgenc.com/api/admin/posts/${editingPost.id}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            toast.promise(savePromise, {
                loading: 'Saving changes...',
                success: 'Post updated successfully!',
                error: 'Failed to update post'
            });

            const response = await savePromise;

            if (response.status === 200) {
                setHasUnsavedChanges(false);
                setInitialPost(response.data);
                navigate('/sentinel');
            }
        } catch (err) {
            console.error('Failed to update post:', err);
            // Revert optimistic update
            setEditingPost(previousPost);
        } finally {
            setIsSaving(false);
        }
    };

    // Confirm before leaving if there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                Edit Post
            </h1>
            <div className={`max-w-4xl mx-auto p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <input
                    type="text"
                    value={editingPost.title}
                    onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                    className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                    placeholder="Title"
                />
                <textarea
                    value={editingPost.summary}
                    onChange={e => setEditingPost({ ...editingPost, summary: e.target.value })}
                    className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                    placeholder="Summary"
                    rows={5}
                />
                <div className={`mb-4 ${isDarkMode ? 'quill-dark' : 'quill-light'}`}>
                    <ReactQuill
                        theme="snow"
                        value={editingPost.content}
                        onChange={content => setEditingPost({ ...editingPost, content })}
                        modules={quillModules}
                        formats={quillFormats}
                        className="min-h-[200px]"
                    />
                </div>
                <input
                    type="number"
                    value={editingPost.read_time}
                    onChange={e => setEditingPost({ ...editingPost, read_time: parseInt(e.target.value) })}
                    className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                    placeholder="Read Time"
                />

                {/* Cover Image Upload */}
                <div className="mb-4">
                    <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Change Cover Image
                    </label>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white file:bg-gray-600 file:text-white file:border-gray-600 file:rounded-md file:px-4  file:mr-4 file:hover:bg-gray-700 file:transition-colors' : 'bg-gray-100 text-gray-900 file:bg-gray-200 file:text-gray-900 file:border-gray-200 file:rounded-md file:px-4  file:mr-4 file:hover:bg-gray-300 file:transition-colors'}`}
                        accept="image/*"
                    />
                </div>

                {/* Add current image preview */}
                {(editingPost?.image_url || initialPost?.image_url) && (
                    <div className="mb-4">
                        <p className="mb-2">Current Image:</p>
                        <img
                            src={editingPost?.image_url || initialPost?.image_url}
                            alt="Current post image"
                            className="max-w-md h-auto rounded-lg shadow-lg"
                        />
                    </div>
                )}

                {/* Preview for new image */}
                {newImage && (
                    <div className="mb-4">
                        <p className="mb-2">New Image Preview:</p>
                        <img
                            src={URL.createObjectURL(newImage)}
                            alt="New image preview"
                            className="max-w-md h-auto rounded-lg shadow-lg"
                        />
                    </div>
                )}

                <div className="flex justify-between items-center mt-4">
                    {hasUnsavedChanges && (
                        <span className="text-yellow-500">
                            You have unsaved changes
                        </span>
                    )}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                if (hasUnsavedChanges) {
                                    if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                                        navigate('/sentinel');
                                    }
                                } else {
                                    navigate('/sentinel');
                                }
                            }}
                            className={`px-4 py-2 rounded transition-colors ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !hasUnsavedChanges}
                            className={`px-4 py-2 rounded transition-colors ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'
                                } disabled:opacity-50`}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
