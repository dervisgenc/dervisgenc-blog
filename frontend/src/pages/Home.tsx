import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SearchBox from '../components/SearchBox';
import BlogCard from '../components/BlogCard';
import NextButton from '../components/NextButton';
import PrevButton from '../components/PrevButon';
import axios from 'axios';
import { useDarkMode } from '@/components/context/DarkModeContext';
import { PostListItem, PaginatedResponse } from '@/types';  // Changed BlogPost to PostListItem
import { useDebounce } from '@/hooks/useDebounce';

const HomePage: React.FC = () => {
    const { isDarkMode } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [posts, setPosts] = useState<PostListItem[]>([]);  // Changed BlogPost to PostListItem
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 9;

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const fetchPosts = async (page: number, query?: string) => {
        setLoading(true);
        try {
            let url = query ?
                `https://blog.dervisgenc.com/api/posts/search?q=${query}&page=${page}&size=${pageSize}` :
                `https://blog.dervisgenc.com/api/posts/paginated?page=${page}&size=${pageSize}`;

            const response = await axios.get<PaginatedResponse>(url);
            setPosts(response.data.posts);
            setTotalPages(response.data.total_pages);
            setError(null);
        } catch (err) {
            setError("Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when search query changes
        fetchPosts(1, debouncedSearchQuery);
    }, [debouncedSearchQuery]);

    useEffect(() => {
        if (!debouncedSearchQuery) {
            fetchPosts(currentPage);
        } else {
            fetchPosts(currentPage, debouncedSearchQuery);
        }
    }, [currentPage]);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <main className={`px-4 py-2 md:px-8 lg:px-16 min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'light bg-f3f4f6'}`}>
            <SearchBox
                isDarkMode={isDarkMode}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <div className="max-w-7xl mx-auto">
                {error && (
                    <div className={`text-center my-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className={`text-center my-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Loading...
                    </div>
                ) : (
                    <>
                        {posts.length === 0 ? (
                            <div className="flex flex-col justify-center mt-12 w-full">
                                <AlertTriangle size={72} className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-4 mx-auto`} />
                                <p className={`text-xl ${isDarkMode ? 'text-red-400' : 'text-red-600'} text-center`}>
                                    {searchQuery ? `No posts found with the search term "${searchQuery}"` : 'No posts available'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {posts.map((post) => (
                                        <a href={`/post/${post.id}`} key={post.id}>
                                            <BlogCard
                                                postId={post.id}
                                                title={post.title}
                                                summary={post.summary}
                                                date={post.created_at}
                                                readTime={`${post.read_time} min read`}
                                                image={encodeURI(post.image_url)}
                                                isDarkMode={isDarkMode} likeCount={post.like_count} />
                                        </a>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center mt-12">
                                    <PrevButton
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                    />

                                    <span className={`text-sm mx-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Page {currentPage} / {totalPages}
                                    </span>

                                    <NextButton
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};

export default HomePage;
