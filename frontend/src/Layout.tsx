import Footer from "./components/Footer";
import Header from "./components/Header";

interface LayoutProps {
    children: React.ReactNode;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export default function Layout({ children, isDarkMode, toggleDarkMode }: LayoutProps) {
    return (
        <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
