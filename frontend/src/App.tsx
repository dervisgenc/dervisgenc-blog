import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Home';
import AdminPage from './pages/Admin';
import LoginPage from './pages/Login';
import PostEditPage from './pages/PostEdit';
import PostAddPage from './pages/PostAdd';
import Layout from './Layout';
import PostStats from './pages/PostStats';
import AllPostsStats from './pages/AllStats';
import PostPage from './pages/Post';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './components/context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import PreviewPost from './pages/PreviewPost';
import AboutMe from './pages/AboutMe';
import { DarkModeProvider } from './components/context/DarkModeContext';
import { Toaster } from "@/components/ui/toaster";
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DarkModeProvider>
          <ErrorBoundary>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/post/:id" element={<PostPage />} />
                <Route path="/about" element={<AboutMe />} />
                <Route path="/sentinel/login" element={<LoginPage />} />
                <Route
                  path="/sentinel/*"
                  element={
                    <PrivateRoute>
                      <Routes>
                        <Route path="/" element={<AdminPage />} />
                        <Route path="/stats" element={<AllPostsStats />} />
                        <Route path="/stats/:id" element={<PostStats />} />
                        <Route path="/post/:id" element={<PreviewPost />} />
                        <Route path="/edit/:id" element={<PostEditPage />} />
                        <Route path="/add" element={<PostAddPage />} />
                      </Routes>
                    </PrivateRoute>
                  }
                />
                {/* Add catch-all route for 404s */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ErrorBoundary>
          <Toaster />
        </DarkModeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
