import { useState } from 'react';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/context/AuthContext';
import { useDarkMode } from '@/components/context/DarkModeContext';
import { quillModules, quillFormats } from '@/utils/quillConfig';
import { toast } from 'react-hot-toast';

export default function PostAddPage() {
    const { isDarkMode } = useDarkMode();
    const { token } = useAuth();
    const navigate = useNavigate();

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [readTime, setReadTime] = useState('5');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isActive, setIsActive] = useState(false);

    // UI states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) newErrors.title = 'Title is required';
        if (!content.trim()) newErrors.content = 'Content is required';
        if (!imageFile) newErrors.image = 'Cover image is required';
        if (!summary.trim()) newErrors.summary = 'Summary is required';
        if (isNaN(Number(readTime)) || Number(readTime) <= 0) {
            newErrors.readTime = 'Read time must be a positive number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            // Clear any existing image error
            setErrors(prev => ({ ...prev, image: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('summary', summary);
        formData.append('readTime', readTime);
        formData.append('isActive', String(isActive));
        if (imageFile) formData.append('image', imageFile);

        try {
            const response = await fetch('https://blog.dervisgenc.com/api/admin/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to create post');

            toast.success('Post created successfully!');
            navigate('/sentinel');
        } catch (error) {
            toast.error('Failed to create post. Please try again.');
            console.error('Error creating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                    Create New Post
                </h1>

                <div className={`p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* Title Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} 
                                ${errors.title ? 'border-red-500' : ''}`}
                            placeholder="Post Title *"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Summary Input */}
                    <div className="mb-4">
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}
                                ${errors.summary ? 'border-red-500' : ''}`}
                            placeholder="Post Summary *"
                            rows={3}
                        />
                        {errors.summary && <p className="text-red-500 text-sm mt-1">{errors.summary}</p>}
                    </div>

                    {/* Rich Text Editor */}
                    <div className={`mb-4 ${isDarkMode ? 'quill-dark' : 'quill-light'}`}>
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={quillModules}
                            formats={quillFormats}
                            className={`min-h-[200px] ${errors.content ? 'border-red-500' : ''}`}
                        />
                        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
                    </div>

                    {/* Read Time Input */}
                    <div className="mb-4">
                        <input
                            type="number"
                            value={readTime}
                            onChange={(e) => setReadTime(e.target.value)}
                            className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}
                                ${errors.readTime ? 'border-red-500' : ''}`}
                            placeholder="Read Time (minutes) *"
                            min="1"
                        />
                        {errors.readTime && <p className="text-red-500 text-sm mt-1">{errors.readTime}</p>}
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4">
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}
                                ${errors.image ? 'border-red-500' : ''}`}
                            accept="image/*"
                        />
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="mt-2 max-w-md h-auto rounded"
                            />
                        )}
                    </div>

                    {/* Publish Toggle */}
                    <div className="mb-6">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="form-checkbox h-5 w-5"
                            />
                            <span>Publish immediately</span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => navigate('/sentinel')}
                            className={`px-4 py-2 rounded transition-colors ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 rounded transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                                } text-white disabled:opacity-50`}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Post'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
