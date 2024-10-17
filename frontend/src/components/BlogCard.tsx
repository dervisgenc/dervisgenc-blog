import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BlogCardProps {
    title: string;
    description: string;
    date: string;
    readTime: string;
    image: string;
    postId: number; // Postu tanımlamak için bir ID ekleyelim
}

const BlogCard: React.FC<BlogCardProps> = ({ title, description, date, readTime, image, postId }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        // Posta tıklandığında, ilgili post sayfasına yönlendiriyoruz
        navigate(`/post/${postId}`);
    };

    return (
        <div
            className="blog-card bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer"
            onClick={handleCardClick}
        >
            <img src={image} alt={title} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="px-3 py-4 space-y-2">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{date}</span>
                    <span>{readTime}</span>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
