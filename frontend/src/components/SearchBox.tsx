import React, { useRef, useEffect } from 'react';

// MatrixRain component that creates a matrix rain effect on a canvas
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

interface SearchBoxProps {
    isDarkMode: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ isDarkMode, searchQuery, setSearchQuery }) => {
    const searchBoxRef = useRef<HTMLDivElement>(null);
    const [searchBoxSize, setSearchBoxSize] = React.useState({ width: 0, height: 0 });

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

    return (
        <div className="search-container max-w-2xl mx-auto mt-8" ref={searchBoxRef}>
            <div className="relative h-10">
                <MatrixRain width={searchBoxSize.width} height={searchBoxSize.height} isDarkMode={isDarkMode} />
                <input
                    type="text"
                    placeholder="Search for cybersecurity articles..."
                    className={`search-box w-full ${isDarkMode ? 'placeholder-bright' : 'placeholder-dark'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
    );
};

export default SearchBox;
