import React from 'react';

interface BlogCardProps {
    title: string;
    summary: string;
    date: string;
    readTime: string;
    image: string;
    postId: number;
}

const BlogCard: React.FC<BlogCardProps> = ({ title, summary, date, readTime, image, postId }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    return (
        <div
            className="blog-card bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer"
            onClick={() => console.log(postId)} // Dummy onClick action
        >
            <img src={image} alt={title} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="px-3 py-4 space-y-2">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{summary}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDate(date)}</span>
                    <span>{readTime}</span>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
