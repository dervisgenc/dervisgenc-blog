import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SearchBox from '../components/SearchBox';
import BlogCard from '../components/BlogCard';
import NextButton from '../components/NextButton';
import PrevButton from '../components/PrevButon';
import axios from 'axios';  // Import axios

interface BlogPost {
    image_url: string;
    id: number;
    title: string;
    summary: string;
    created_at: string;  // Backend'den gelen tarih (created_at)
    read_time: number;   // Backend'den gelen okuma süresi (read_time)
}

interface HomePageProps {
    isDarkMode: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ isDarkMode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [error, setError] = useState<string | null>(null);
    const postsPerPage = 6;

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:8080/posts");
                setBlogPosts(response.data);
            } catch (err) {
                // Backend bağlantısı hatası için sadece bir bilgi mesajı göstermek
                setError("Connection error. Still fetching posts...");
            }
        };

        fetchPosts();
    }, []);

    const filteredPosts = searchQuery
        ? blogPosts.filter((post) =>
            (post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
            (post.summary?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
        )
        : blogPosts;

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

    useEffect(() => {
        if (currentPage > Math.ceil(filteredPosts.length / postsPerPage)) {
            setCurrentPage(1);
        }
    }, [filteredPosts, currentPage]);

    // Hata durumu olsa bile sayfa çalışmaya devam eder
    return (
        <main className="px-4 md:px-8 lg:px-16 min-h-screen">
            <SearchBox isDarkMode={isDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-7xl mx-auto">
                {/* Backend bağlantısı hatası durumunda bilgi mesajı */}
                {error && (
                    <div className="text-red-500 text-center my-4">
                        {error}
                    </div>
                )}
                {searchQuery && filteredPosts.length === 0 && !error ? (
                    <div className="flex flex-col justify-center mt-12 w-full">
                        <AlertTriangle size={72} className="text-red-500 mb-4 mx-auto" />
                        <p className="text-xl text-red-500 text-center">
                            No posts found with the search term "{searchQuery}"
                        </p>
                    </div>
                ) : null}
                {/* Boş post durumu */}
                {currentPosts.length === 0 && !error && searchQuery === '' ? (
                    <div className="text-gray-500 text-center my-4">
                        No post yet
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentPosts.map((post, index) => (
                                <a href={`/post/${post.id}`} key={index}>
                                    <BlogCard
                                        postId={post.id}
                                        title={post.title}
                                        summary={post.summary}
                                        date={post.created_at ? post.created_at : "Unknown Date"}
                                        readTime={post.read_time ? `${post.read_time} min read` : "Unknown Read Time"}
                                        image={encodeURI(post.image_url)}
                                        isDarkMode={isDarkMode}  // Dark mode prop'u ekledik
                                    />
                                </a>
                            ))}
                        </div>

                        {/* Pagination */}
                        {filteredPosts.length > postsPerPage && (
                            <div className="flex justify-between items-center mt-12">
                                <PrevButton
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                />

                                <span className="text-gray-500 text-sm mx-4">
                                    Page {currentPage} / {Math.ceil(filteredPosts.length / postsPerPage)}
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
