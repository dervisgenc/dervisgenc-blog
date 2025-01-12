import Footer from "./components/Footer";
import Header from "./components/Header";
import { useDarkMode } from "./components/context/DarkModeContext";

interface LayoutProps {
    children: React.ReactNode;
    hideHeader?: boolean;
}

export default function Layout({ children }: LayoutProps) {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            {window.location.pathname !== '/about' && (
                <>
                    <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                </>
            )}
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
