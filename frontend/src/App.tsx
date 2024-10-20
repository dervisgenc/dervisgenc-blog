import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Home';
import AdminPage from './pages/Admin';
import LoginPage from './pages/Login';
import PostEditPage from './pages/PostEdit';
import PostAddPage from './pages/PostAdd';
import Layout from './Layout';
import { useState } from 'react';
import PostStats from './pages/PostStats';
import AllPostsStats from './pages/AllStats';
import PostPage from './pages/Post';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './components/context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import PreviewPost from './pages/PreviewPost';
import AboutMe from './pages/AboutMe';

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <Router>
      <ErrorBoundary>
        <Layout isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}>
          <Routes>
            <Route path="/" element={<HomePage isDarkMode={isDarkMode} />} />
            <Route path="/post/:id" element={<PostPage isDarkMode={isDarkMode} />} />
            <Route path="/about" element={<AboutMe />} />
            <Route path="/sentinel/login" element={<LoginPage />} />
            <Route path="/sentinel" element={<PrivateRoute><AdminPage isDarkMode={isDarkMode} /></PrivateRoute>} />
            <Route path="/sentinel/post/:id" element={<PrivateRoute><PreviewPost /></PrivateRoute>} />
            <Route path="/edit/:id" element={<PrivateRoute><PostEditPage /></PrivateRoute>} />
            <Route path="/add" element={<PrivateRoute><PostAddPage /></PrivateRoute>} />
            <Route path="/sentinel/stats/:id" element={<PrivateRoute><PostStats /></PrivateRoute>} />
            <Route path="/sentinel/stats" element={<PrivateRoute><AllPostsStats /></PrivateRoute >} />
          </Routes >
        </Layout >
      </ErrorBoundary>
    </Router >
  );

}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
