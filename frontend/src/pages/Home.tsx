import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SearchBox from '../components/SearchBox';
import BlogCard from '../components/BlogCard';
import NextButton from '../components/NextButton';
import PrevButton from '../components/PrevButon';
import axios from 'axios';  // Import axios

interface BlogPost {
    id: number;
    title: string;
    description: string;
    date: string;
    readTime: string;
    image: string;
}

interface HomePageProps {
    isDarkMode: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ isDarkMode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);  // Fetch posts from the API
    const [error, setError] = useState<string | null>(null);      // Error state for handling issues
    const postsPerPage = 6;

    // Ensure useEffect runs only once on mount
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/posts");  // Use environment variable
                console.log("request sent");
                setBlogPosts(response.data);
            } catch (err) {
                setError("Failed to fetch posts");
            }
        };

        fetchPosts();
    }, []);  // Empty array to run only once

    const filteredPosts = blogPosts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    const nextPage = () => {
        if (currentPage < Math.ceil(filteredPosts.length / postsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (error) {
        return <p>{error}</p>;  // Display error message if something goes wrong
    }

    return (
        <main className="px-4 md:px-8 lg:px-16">
            <SearchBox isDarkMode={isDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-7xl mx-auto">
                {/* Check if a search has been performed */}
                {searchQuery && filteredPosts.length === 0 ? (
                    <div className="flex flex-col justify-center mt-12 w-full">
                        <AlertTriangle size={72} className="text-red-500 mb-4 mx-auto" />
                        <p className="text-xl text-red-500 text-center">
                            Aramanızla eşleşen makale bulunamadı.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Display posts if they exist */}
                        {currentPosts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {currentPosts.map((post, index) => (
                                    <BlogCard
                                        postId={post.id}
                                        key={index}
                                        title={post.title}
                                        description={post.description}
                                        date={post.date}
                                        readTime={post.readTime}
                                        image={post.image}
                                    />
                                ))}
                            </div>
                        ) : null}

                        {/* Pagination */}
                        {filteredPosts.length > postsPerPage && (
                            <div className="flex justify-between items-center mt-12">
                                <PrevButton
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                />

                                <span className="text-gray-500 text-sm mx-4">
                                    Sayfa {currentPage} / {Math.ceil(filteredPosts.length / postsPerPage)}
                                </span>

                                <NextButton
                                    onClick={nextPage}
                                    disabled={currentPage === Math.ceil(filteredPosts.length / postsPerPage)}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};

export default HomePage;
