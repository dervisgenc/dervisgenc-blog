import DOMPurify from 'dompurify';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, Share2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from '@/components/context/AuthContext';
import { useDarkMode } from '@/components/context/DarkModeContext';

interface Post {
    id: number;
    title: string;
    summary: string;
    content: string;
    image_url: string;
    likes: number;
    shares: number;
}





export default function PostPage() {
    const { isDarkMode } = useDarkMode();
    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [likeCount, setLikeCount] = useState(0);
    const [shareCount, setShareCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`https://blog.dervisgenc.com/api/admin/posts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPost(response.data);
                setLikeCount(response.data.likes);
                setShareCount(response.data.shares);
            } catch (err) {
                setError("Failed to fetch post");
            }
        };

        fetchPost();
    }, [token, id]);

    if (error) {
        return (
            <div className={`min-h-screen p-4 flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
                <AlertTriangle size={72} className="text-red-500 mb-4" />
                <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
                <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Post you are searching for not found or an error occured</p>
                <Button
                    variant="outline"
                    className={`transition-all duration-300 ease-in-out ${isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'}`}
                    onClick={() => window.location.href = '/'}
                >
                    Return to Home Page
                </Button>
            </div>
        );
    }

    if (!post) {
        return <p>Loading...</p>;
    }

    const handleLike = () => {
        if (isLiked) {
            setLikeCount(likeCount - 1);
        } else {
            setLikeCount(likeCount + 1);
        }
        setIsLiked(!isLiked);
    };

    const handleShare = () => {
        setShareCount(shareCount + 1);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
    };

    // Sanitize the HTML content from the post
    const sanitizedContent = DOMPurify.sanitize(post.content);
    const encodedImageUrl = encodeURI(post.image_url);

    return (
        <div className={`min-h-screen p-4 md:p-8 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <Card className={`max-w-4xl mx-auto overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="relative h-64 md:h-96">
                    <img
                        src={encodedImageUrl}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-gray-900' : 'from-gray-700'} to-transparent`} />
                    <h1 className="absolute bottom-4 left-4 right-4 text-2xl md:text-4xl font-bold text-white">
                        {post.title}
                    </h1>
                </div>

                {/* Summary added below the title */}
                <CardContent className="p-6">
                    <p className={`mb-6 italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{post.summary}</p>
                    <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                        <div
                            className={`leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="max-w-4xl mx-auto mt-8 flex justify-between items-center">
                <div className="flex space-x-4">
                    <Button
                        variant="outline"
                        className={`transition-all duration-300 ease-in-out ${isDarkMode
                            ? 'bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700'
                            : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'
                            } ${isLiked ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}
                        onClick={handleLike}
                    >
                        <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? 'animate-pulse' : ''}`} />
                        Like ({likeCount})
                    </Button>
                    <Button
                        variant="outline"
                        className={`transition-all duration-300 ease-in-out ${isDarkMode
                            ? 'bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700'
                            : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'
                            } ${isShared ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : ''}`}
                        onClick={handleShare}
                    >
                        <Share2 className={`mr-2 h-4 w-4 ${isShared ? 'animate-spin' : ''}`} />
                        Share ({shareCount})
                    </Button>
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Reading time: 5 min
                </div>
            </div>
        </div>
    );
}
