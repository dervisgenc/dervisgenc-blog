import DOMPurify from 'dompurify';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, Share2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from "react";
import axios from 'axios';
import { useDarkMode } from '@/components/context/DarkModeContext';
import { PostDetail } from '@/types';
import { useLike } from '@/hooks/useLike';
import { useToast } from "@/hooks/use-toast";
import { shareContent } from "@/utils/share";

interface ExtendedPostDetail extends PostDetail {
    likes?: number;
    shares?: number;
}

export default function PostPage() {
    const { isDarkMode } = useDarkMode();
    const { id } = useParams();
    const [post, setPost] = useState<ExtendedPostDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [, setShareCount] = useState(0);
    const [isShared, setIsShared] = useState(false);
    const { toast } = useToast();

    const {
        likeCount,
        isLiked,
        isLoading,
        toggleLike
    } = useLike({
        postId: Number(id),
        initialLikeCount: post?.like_count ?? 0
    });

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`https://blog.dervisgenc.com/api/posts/${id}`);
                setPost(response.data);
                setShareCount(response.data.shares);
            } catch (err) {
                setError("Failed to fetch post");
            }
        };

        fetchPost();
    }, [id]);

    if (error) {
        return (
            <div className={`min-h-screen p-4 flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
                <AlertTriangle size={72} className="text-red-500 mb-4" />
                <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
                <p className="text-lg text-gray-400 mb-8">Post you are searching for not found or an error occurred</p>
                <Button
                    variant="outline"
                    className="bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700 transition-all duration-300 ease-in-out"
                    onClick={() => window.location.href = '/'}
                >
                    Return to Home Page
                </Button>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 mb-4"></div>
                    <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                </div>
            </div>
        );
    }

    const handleShare = async () => {
        setIsShared(true);
        const result = await shareContent(
            post.title,
            post.summary || 'Check out this blog post!',
            window.location.href
        );

        toast({
            title: result.success ? "Success!" : "Notice",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });

        setTimeout(() => setIsShared(false), 1000);
    };

    // Sanitize the HTML content from the post
    const sanitizedContent = DOMPurify.sanitize(post.content);
    const encodedImageUrl = encodeURI(post.image_url);

    return (
        <div className={`min-h-screen p-4 md:p-8 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-black'}`}>
            <Card className={`max-w-4xl mx-auto overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                <div className="relative h-64 md:h-96">
                    <img
                        src={encodedImageUrl}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Modified gradient with multiple color stops */}
                    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent' : 'bg-gradient-to-t from-gray-900 via-gray-900/10 to-transparent'}`} />

                    <h1 className={`absolute bottom-4 left-4 right-4 text-2xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-100'}`}>
                        {post.title}
                    </h1>
                </div>


                {/* Summary added below the title */}
                <CardContent className="p-6">
                    <p className={`mb-6 italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{post.summary}</p> {/* Summary with a different style */}
                    <div className="prose max-w-none">
                        <div
                            className={`leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="max-w-4xl mx-auto mt-6 flex justify-between items-center px-4">
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className={`
                            relative group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                            transition-all duration-300 ease-in-out
                            ${isDarkMode
                                ? 'hover:bg-gray-800 focus:bg-gray-800'
                                : 'hover:bg-gray-100 focus:bg-gray-100'
                            }
                            ${isLiked
                                ? 'text-purple-500 dark:text-purple-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }
                        `}
                        onClick={toggleLike}
                        disabled={isLoading}
                    >
                        <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs font-medium">{likeCount}</span>
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        className={`
                            relative group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                            transition-all duration-300 ease-in-out
                            ${isDarkMode
                                ? 'hover:bg-gray-800 focus:bg-gray-800'
                                : 'hover:bg-gray-100 focus:bg-gray-100'
                            }
                            ${isShared
                                ? 'text-cyan dark:text-cyan-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }
                        `}
                        onClick={handleShare}
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium md:inline-block">Share</span>
                    </Button>
                </div>

                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {post.read_time} min read
                </div>
            </div>
        </div>
    );
}
