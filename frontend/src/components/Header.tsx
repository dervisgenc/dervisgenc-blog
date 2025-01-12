import React from 'react';
import { Moon, Sun, Home, Shield, Wifi } from 'lucide-react';
import CyberTronLogo from './ui/CyberTronLogo';
import Tooltip from 'react-tooltip';

interface HeaderProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
    return (
        <header className='w-full flex items-center justify-between'>
            <div className="flex items-center">
                <CyberTronLogo size={30} className="mr-2 relative top-0.5" />
                <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-700">
                    <a href="/">CyberTron</a>
                </h1>
            </div>
            <nav className="flex items-center space-x-4">
                <a href="/" data-tooltip-id="home-tooltip" data-tooltip-content="Home">
                    <Home size={20} />
                </a>
                <a
                    href="/sentinel"
                    data-tooltip-id="admin-tooltip"
                    data-tooltip-content="Admin Panel"
                >
                    <Shield size={20} />
                </a>
                <a
                    href="/about"
                    data-tooltip-id="about-tooltip"
                    data-tooltip-content="About Me"
                >
                    <Wifi size={20} />
                </a>
                <button
                    onClick={toggleDarkMode}
                    className="theme-toggle"
                    data-tooltip-id="theme-tooltip"
                    data-tooltip-content={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </nav>

            {/* Tooltips */}
            <Tooltip
                id="home-tooltip"
                place="bottom"
                className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} px-2 py-1 text-sm rounded shadow-lg`}
            />
            <Tooltip
                id="admin-tooltip"
                place="bottom"
                className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} px-2 py-1 text-sm rounded shadow-lg`}
            />
            <Tooltip
                id="about-tooltip"
                place="bottom"
                className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} px-2 py-1 text-sm rounded shadow-lg`}
            />
            <Tooltip
                id="theme-tooltip"
                place="bottom"
                className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} px-2 py-1 text-sm rounded shadow-lg`}
            />
        </header>
    );
};

export default Header;
