import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, Share2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle icon
import { useState, useEffect } from "react";
import axios from 'axios';

interface Post {
    id: number;
    title: string;
    content: string;
    imageUrl: string;
    likes: number;
    shares: number;
}

export default function PostPage() {
    const { id } = useParams(); // Get post ID from URL params
    const [post, setPost] = useState<Post | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [likeCount, setLikeCount] = useState(0);
    const [shareCount, setShareCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isShared, setIsShared] = useState(false);

    // Fetch post data from the backend
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/posts/${id}`);
                setPost(response.data);
                setLikeCount(response.data.likes);
                setShareCount(response.data.shares);
            } catch (err) {
                setError("Failed to fetch post");
            }
        };

        fetchPost();
    }, [id]); // Fetch the post when the component mounts or when the ID changes

    // Eğer bir hata varsa daha görsel bir hata ekranı gösterelim
    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 p-4 flex flex-col items-center justify-center">
                <AlertTriangle size={72} className="text-red-500 mb-4" />
                <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
                <p className="text-lg text-gray-400 mb-8">Post you are searching for not found or an error occured</p>
                <Button
                    variant="outline"
                    className="bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700 transition-all duration-300 ease-in-out"
                    onClick={() => window.location.href = '/'} // Go back to home
                >
                    Return the Home Page
                </Button>
            </div>
        );
    }

    if (!post) {
        return <p>Loading...</p>; // Show loading message while fetching data
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

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
            <Card className="max-w-4xl mx-auto bg-gray-800 border-gray-700 overflow-hidden">
                <div className="relative h-64 md:h-96">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                    <h1 className="absolute bottom-4 left-4 right-4 text-2xl md:text-4xl font-bold text-white">
                        {post.title}
                    </h1>
                </div>
                <CardContent className="p-6">
                    <div className="prose prose-invert max-w-none">
                        {post.content.split('\n\n').map((paragraph, index) => (
                            <p key={index} className="text-gray-300 leading-relaxed mb-4">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="max-w-4xl mx-auto mt-8 flex justify-between items-center">
                <div className="flex space-x-4">
                    <Button
                        variant="outline"
                        className={`bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700 transition-all duration-300 ease-in-out ${isLiked ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                        onClick={handleLike}
                    >
                        <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? 'animate-pulse' : ''}`} />
                        Like ({likeCount})
                    </Button>
                    <Button
                        variant="outline"
                        className={`bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700 transition-all duration-300 ease-in-out ${isShared ? 'bg-cyan-600 hover:bg-cyan-700' : ''}`}
                        onClick={handleShare}
                    >
                        <Share2 className={`mr-2 h-4 w-4 ${isShared ? 'animate-spin' : ''}`} />
                        Share ({shareCount})
                    </Button>
                </div>
                <div className="text-sm text-gray-400">
                    Reading time: 5 min
                </div>
            </div>
        </div>
    );
}
