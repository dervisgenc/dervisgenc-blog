import { Info } from 'lucide-react'
import { useDarkMode } from './context/DarkModeContext';


export default function Footer() {
    const { isDarkMode } = useDarkMode();
    return (
        <footer className="bg-gray-900 text-gray-400 py-2 border-t border-gray-800 w-full">
            <div className="flex justify-between items-center px-6">
                <div className="text-purple-400 font-semibold">
                    CyberTron
                </div>

                {/* Center: © 2024 Derviş Genç */}
                <div className="text-xs text-center">
                    Derviş Genç © 2024
                </div>

                {/* Right: About Me Button */}
                <div className="text-right">
                    <button
                        className={`flex items-center ${isDarkMode ? 'bg-gray-800 hover:bg-purple-700 text-gray-300' : 'bg-gray-100 hover:bg-purple-400 text-gray-800'
                            } px-4 py-1 rounded-full text-xs transition duration-300 ease-in-out whitespace-nowrap`}
                        onClick={(e) => {
                            e.currentTarget.blur();
                            window.location.href = '/about';
                        }}
                    >
                        <Info size={12} className="mr-2" />
                        About Me
                    </button>


                </div>
            </div>
        </footer>
    );
}
