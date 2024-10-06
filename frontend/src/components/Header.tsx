import React from 'react';
import { Moon, Sun, Home, Shield, Wifi } from 'lucide-react';
import DynamicText from './DynamicText';

interface HeaderProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
    return (
        <header className='w-full'>
            <h1 className="dynamic-text">
                <DynamicText text="CyberNexus" />
            </h1>
            <nav>
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
