import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '@/components/context/DarkModeContext';

export default function NotFound() {
    const navigate = useNavigate();
    const { isDarkMode } = useDarkMode();

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
            }`}>
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                    404
                </h1>
                <p className="text-xl mb-8">Page not found</p>
                <button
                    onClick={() => navigate('/')}
                    className={`px-6 py-2 rounded-lg transition-colors ${isDarkMode
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}
