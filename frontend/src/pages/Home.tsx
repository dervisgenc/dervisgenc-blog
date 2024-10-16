
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SearchBox from '../components/SearchBox';
import BlogCard from '../components/BlogCard';
import NextButton from '../components/NextButton';
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
        description: 'Explore the lates hacking techniques and how to protect against them in this comprehensive guide.',
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
        description: 'Explore the lates hacking techniques and how to protect against them in this comprehensive guide.',
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
        title: 'test',
        description: 'Discover how artificial intelligence is revolutionizing the cybersecurity landscape.',
        date: 'May 25, 2023',
        readTime: '6 min read',
        image: `./vite.svg`,
    },


];

const HomePage: React.FC<HomePageProps> = ({ isDarkMode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;

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

    return (
        <main className="px-4 md:px-8 lg:px-16">
            <SearchBox isDarkMode={isDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-7xl mx-auto">
                {filteredPosts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                ) : (
                    <div className="flex flex-col justify-center mt-12 w-full">
                        <AlertTriangle size={72} className="text-red-500 mb-4 mx-auto" />
                        <p className="text-xl text-red-500 text-center">
                            Aramanızla eşleşen makale bulunamadı.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default HomePage;
