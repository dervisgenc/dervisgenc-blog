import axios from 'axios';

export async function shareContent(title: string, text: string, url: string) {
    try {
        // Extract post ID from URL
        const postId = url.split('/').pop();

        // Try to share using Web Share API
        if (navigator.share) {
            await navigator.share({
                title,
                text,
                url
            });

            // Track successful share
            await axios.post(`https://blog.dervisgenc.com/api/posts/${postId}/share`);

            return {
                success: true,
                message: 'Successfully shared!'
            };
        } else {
            // Fallback to copy to clipboard
            await navigator.clipboard.writeText(url);

            // Still track as share even if just copied
            await axios.post(`https://blog.dervisgenc.com/api/posts/${postId}/share`);

            return {
                success: true,
                message: 'URL copied to clipboard!'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: 'Failed to share content'
        };
    }
}
