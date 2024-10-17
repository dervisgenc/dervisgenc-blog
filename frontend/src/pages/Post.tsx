import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, Share2 } from 'lucide-react';
import { useState } from "react";

// Simulated post data (alternatively you can fetch this from a server or state)
const blogPosts = [
    {
        id: 1,
        title: 'Hacking Techniques: A Deep Dive',
        content: `Explore the latest hacking techniques and how to protect against them.`,
        imageUrl: "/vite.svg",
        likes: 128,
        shares: 57,
    },
    {
        id: 2,
        title: 'Cybersecurity Trends 2023',
        content: `Stay ahead of the curve with our analysis of the top cybersecurity trends for 2023.`,
        imageUrl: "/vite.svg",
        likes: 150,
        shares: 65,
    },
    // other posts...
];

export default function PostPage() {
    const { id } = useParams(); // Get post ID from URL params
    const post = blogPosts.find((p) => p.id === parseInt(id!)); // Find the post by ID

    if (!post) {
        return <p>Post not found</p>; // Show error if no post is found
    }

    const [likeCount, setLikeCount] = useState(post.likes);
    const [shareCount, setShareCount] = useState(post.shares);
    const [isLiked, setIsLiked] = useState(false);
    const [isShared, setIsShared] = useState(false);

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
                        className={`bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700 transition-all duration-300 ease-in-out ${isLiked ? 'bg-purple-600 hover:bg-purple-700' : ''
                            }`}
                        onClick={handleLike}
                    >
                        <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? 'animate-pulse' : ''}`} />
                        Like ({likeCount})
                    </Button>
                    <Button
                        variant="outline"
                        className={`bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700 transition-all duration-300 ease-in-out ${isShared ? 'bg-cyan-600 hover:bg-cyan-700' : ''
                            }`}
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
