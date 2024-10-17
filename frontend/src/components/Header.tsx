import React from 'react';
import { Moon, Sun, Home, Shield, Wifi } from 'lucide-react';
import CyberTronLogo from './ui/CyberTronLogo';  // Logo bileşenini içeri aktarıyoruz

interface HeaderProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
    return (
        <header className='w-full flex items-center justify-between p-4'>
            <div className="flex items-center">
                {/* Logo biraz aşağı kaydırıldı */}
                <CyberTronLogo size={40} className="mr-2 relative top-0.5" />
                <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-700">
                    <a href="/">CyberTron</a>
                </h1>
            </div>
            <nav className="flex items-center space-x-4">
                <a href="/"><Home size={20} /></a>
                <a href="#"><Shield size={20} /></a>
                <a href="#"><Wifi size={20} /></a>
                <button
                    onClick={toggleDarkMode}
                    className="theme-toggle"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </nav>
        </header>
    );
};

export default Header;
