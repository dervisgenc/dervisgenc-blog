import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SearchBox from '../components/SearchBox';
import BlogCard from '../components/BlogCard';
import NextButton from '../components/NextButton';  // Assuming your NextButton is in components folder
import PrevButton from '../components/PrevButon';

interface BlogPost {
    title: string;
    description: string;
    date: string;
    readTime: string;
    image: string;
}

interface HomePageProps {
    isDarkMode: boolean;
}

const blogPosts: BlogPost[] = [
    {
        title: 'Hacking Techniques: A Deep Dive',
        description: 'Explore the latest hacking techniques and how to protect against them in this comprehensive guide.',
        date: 'May 15, 2023',
        readTime: '5 min read',
        image: `./vite.svg`,
    },
    {
        title: 'Cybersecurity Trends 2023',
        description: 'Stay ahead of the curve with our analysis of the top cybersecurity trends for 2023.',
        date: 'May 20, 2023',
        readTime: '7 min read',
        image: `./vite.svg`,
    },
    {
        title: 'AI in Cybersecurity',
        description: 'Discover how artificial intelligence is revolutionizing the cybersecurity landscape.',
        date: 'May 25, 2023',
        readTime: '6 min read',
        image: `./vite.svg`,
    },
    {
        title: 'Hacking Techniques: A Deep Dive',
        description: 'Explore the latest hacking techniques and how to protect against them in this comprehensive guide.',
        date: 'May 15, 2023',
        readTime: '5 min read',
        image: `./vite.svg`,
    },
    {
        title: 'Cybersecurity Trends 2023',
        description: 'Stay ahead of the curve with our analysis of the top cybersecurity trends for 2023.',
        date: 'May 20, 2023',
        readTime: '7 min read',
        image: `./vite.svg`,
    },
    {
        title: 'AI in Cybersecurity',
        description: 'Discover how artificial intelligence is revolutionizing the cybersecurity landscape.',
        date: 'May 25, 2023',
        readTime: '6 min read',
        image: `./vite.svg`,
    },


];

const HomePage: React.FC<HomePageProps> = ({ isDarkMode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);  // Sayfa numarası state
    const postsPerPage = 6;  // Her sayfada gösterilecek blog sayısı

    // Blog postları filtreleme
    const filteredPosts = blogPosts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sayfalama için mevcut sayfada gösterilecek blogları hesaplama
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    // Sayfa değiştirme fonksiyonları
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

    return (
        <main className="container">
            <SearchBox isDarkMode={isDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            {filteredPosts.length > 0 ? (
                <>
                    <div className="blog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentPosts.map((post, index) => (
                            <BlogCard
                                key={index}
                                title={post.title}
                                description={post.description}
                                date={post.date}
                                readTime={post.readTime}
                                image={post.image}
                            />
                        ))}
                    </div>

                    {/* Sayfalama Düğmeleri */}
                    {filteredPosts.length > postsPerPage && (
                        <div className="flex justify-between items-center mt-12">
                            <PrevButton
                                onClick={prevPage}
                                disabled={currentPage === 1}  // Son sayfada ileri gitme devre dışı
                            />

                            <span className="text-gray-500 text-sm mx-4">
                                Page {currentPage} of {Math.ceil(filteredPosts.length / postsPerPage)}
                            </span>

                            {/* NextButton Component */}
                            <NextButton
                                onClick={nextPage}
                                disabled={currentPage === Math.ceil(filteredPosts.length / postsPerPage)}  // Son sayfada ileri gitme devre dışı
                            />
                        </div>
                    )}

                </>
            ) : (
                <div className="flex flex-col items-center justify-center mt-12">
                    <AlertTriangle size={72} className="text-red-500 mb-4" />
                    <p className="text-xl text-red-500 text-center">
                        No articles found matching your search.
                    </p>
                </div>
            )}
        </main>
    );
};

export default HomePage;
