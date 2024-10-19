import React from 'react';

interface BlogCardProps {
    title: string;
    summary: string;
    date: string;
    readTime: string;
    image: string;
    postId: number;
    isDarkMode: boolean;  // Yeni prop
}

const BlogCard: React.FC<BlogCardProps> = ({ title, summary, date, readTime, image, isDarkMode }) => {
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
            className={`blog-card ${isDarkMode ? 'bg-gray-900' : 'bg-white'} dark:bg-gray-800 rounded-lg shadow-md cursor-pointer h-[360px] w-full mx-auto flex flex-col justify-between`}
        >
            <div className="relative">
                <img src={image} alt={title} className="w-full h-48 object-cover rounded-t-lg" />
                <h2 className={`bottom-0 left-0 text-xl font-semibold text-white px-3 py-1 shadow-md truncate 
                        ${isDarkMode ? 'bg-black bg-opacity-70' : 'bg-white bg-opacity-70'}`}>
                    {title}
                </h2>
            </div>

            <div className=''>
                <div className="px-3 py-3 space-y-2">
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 overflow-hidden text-ellipsis whitespace-normal">
                        {summary || '\u00A0'}
                    </p>
                </div>
                <div className="px-3 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-auto py-2">
                    <span>{formatDate(date)}</span>
                    <span>{readTime}</span>
                </div>
            </div>

        </div>
    );
};

export default BlogCard;
