import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Home, Shield, Wifi, AlertTriangle } from 'lucide-react';

interface BlogPost {
    title: string;
    description: string;
    date: string;
    readTime: string;
    image: string;
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
];

const MatrixRain: React.FC<{ width: number; height: number; isDarkMode: boolean }> = ({ width, height, isDarkMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = width;
        canvas.height = height;

        const columns = Math.floor(canvas.width / 10);
        const drops: number[] = Array(columns).fill(1);

        const draw = () => {
            ctx.fillStyle = isDarkMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = isDarkMode ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 100, 0, 0.3)';
            ctx.font = '10px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = Math.random() > 0.5 ? '1' : '0';
                ctx.fillText(text, i * 10, drops[i] * 10);

                if (drops[i] * 10 > canvas.height && Math.random() > 0.95) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);

        return () => clearInterval(interval);
    }, [width, height, isDarkMode]);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />;
};

const DynamicText: React.FC<{ text: string }> = ({ text }) => {
    const [colors, setColors] = useState(['#8B5CF6', '#EC4899', '#EF4444']);

    useEffect(() => {
        const interval = setInterval(() => {
            setColors((prevColors) => {
                const newColors = [...prevColors];
                newColors.unshift(newColors.pop() as string);
                return newColors;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <span className="relative">
            {text.split('').map((char, index) => (
                <span key={index} className="transition-colors duration-2000" style={{ color: colors[index % colors.length] }}>
                    {char}
                </span>
            ))}
        </span>
    );
};

const HomePage: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [searchBoxSize, setSearchBoxSize] = useState({ width: 0, height: 0 });
    const [searchQuery, setSearchQuery] = useState(''); // Search query state
    const searchBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateSize = () => {
            if (searchBoxRef.current) {
                setSearchBoxSize({
                    width: searchBoxRef.current.offsetWidth,
                    height: searchBoxRef.current.offsetHeight,
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Filter blog posts based on search query
    const filteredPosts = blogPosts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <header>
                <h1 className="dynamic-text">
                    <DynamicText text="CyberNexus" />
                </h1>
                <nav>
                    <a href="#"><Home size={20} /></a>
                    <a href="#"><Shield size={20} /></a>
                    <a href="#"><Wifi size={20} /></a>
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="theme-toggle"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </nav>
            </header>
            <main className="container">
                <div className="search-container" ref={searchBoxRef}>
                    <div className="relative h-10">
                        <MatrixRain width={searchBoxSize.width} height={searchBoxSize.height} isDarkMode={isDarkMode} />
                        <input
                            type="text"
                            placeholder="Search for cybersecurity articles..."
                            className={`search-box ${isDarkMode ? 'placeholder-bright' : 'placeholder-dark'}`}
                            value={searchQuery} // Control the value in the search box
                            onChange={(e) => setSearchQuery(e.target.value)} // Capture changes in the search box
                        />
                    </div>
                </div>

                {/* Eğer sonuç bulunursa */}
                {filteredPosts.length > 0 ? (
                    <div className="blog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, index) => (
                            <div key={index} className="blog-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                                <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                                <div className="mt-4">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{post.title}</h2>
                                    <p className="text-gray-600 dark:text-gray-400">{post.description}</p>
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-4">
                                        <span>{post.date}</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Eğer sonuç bulunmazsa */
                    <div className="flex flex-col items-center justify-center mt-12">
                        <AlertTriangle size={72} className="text-red-500 mb-4" />
                        <p className="text-xl text-red-500 text-center">
                            No articles found matching your search.
                        </p>
                    </div>
                )}
            </main>

        </div>
    );
};

export default HomePage;
