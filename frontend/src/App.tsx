import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Home';
import AdminPage from './pages/Admin';
import LoginPage from './pages/Login';
import PostEditPage from './pages/PostEdit';
import PostAddPage from './pages/PostAdd';
import Layout from './Layout';
import { useState } from 'react';

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <Router>
      <Layout isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}>
        <Routes>
          <Route path="/" element={<HomePage isDarkMode={isDarkMode} />} />
          <Route path="/sentinel" element={<AdminPage />} />
          <Route path="/sentinel/login" element={<LoginPage />} />
          <Route path="/edit/:id" element={<PostEditPage />} />
          <Route path="/add" element={<PostAddPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return <AppContent />;
}

export default App;
