import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

interface UseLikeProps {
    postId: number;
    initialLikeCount: number;
}

export function useLike({ postId, initialLikeCount }: UseLikeProps) {
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial like status
    useEffect(() => {
        const fetchLikeStatus = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/posts/${postId}/like`);
                const { has_liked, likes } = response.data;
                setIsLiked(has_liked);
                setLikeCount(likes);
            } catch (err) {
                console.error('Failed to fetch like status:', err);
                setError('Failed to fetch like status');
            }
        };

        fetchLikeStatus();
    }, [postId]);

    const toggleLike = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`http://localhost:8080/posts/${postId}/like`);
            const { likes } = response.data;
            setLikeCount(likes);
            setIsLiked(!isLiked);
        } catch (err) {
            setError('Failed to toggle like');
            console.error('Failed to toggle like:', err);
        } finally {
            setIsLoading(false);
        }
    }, [postId, isLiked]);

    return {
        likeCount,
        isLiked,
        isLoading,
        error,
        toggleLike
    };
}
