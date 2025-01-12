import React from 'react';
import { useDarkMode } from '@/components/context/DarkModeContext';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <FallbackComponent error={this.state.error} />;
        }

        return this.props.children;
    }
}

function FallbackComponent({ error }: { error?: Error }) {
    const { isDarkMode } = useDarkMode();

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
            }`}>
            <div className="text-center p-8">
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                    Oops! Something went wrong
                </h1>
                <p className="mb-4 text-gray-500">
                    {error?.message || 'An unexpected error occurred'}
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className={`px-6 py-2 rounded-lg transition-colors ${isDarkMode
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                >
                    Return Home
                </button>
            </div>
        </div>
    );
}
