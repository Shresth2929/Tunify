import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import Home from './pages/Home';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminPanel from './pages/admin/AdminPanel';
import SongManager from './pages/admin/SongManager';
import PlaylistManager from './pages/admin/PlaylistManager';
import AIPage from './pages/AIPage';
import useAuthStore from './store/authStore';
import { Menu } from 'lucide-react';
import { useState } from 'react';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      <main className="flex-1 overflow-hidden flex flex-col relative min-w-0">
        <div className="md:hidden flex items-center p-4 pb-0 z-10 relative">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white hover:text-primary-400">
            <Menu size={28} />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}

import Welcome from './pages/Welcome';

function PlayerWrapper() {
  const location = useLocation();
  const hidePlayerRoutes = ['/login', '/welcome', '/forgot-password', '/reset-password'];
  
  if (hidePlayerRoutes.some(route => location.pathname.startsWith(route))) return null;
  return <MusicPlayer />;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid rgba(249,115,22,0.3)',
            fontFamily: 'Space Grotesk, Inter, sans-serif',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#F97316', secondary: '#1A1A1A' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1A1A1A' } },
        }}
      />
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/" element={isAuthenticated ? <Layout><Home /></Layout> : <Navigate to="/welcome" replace />} />
        <Route path="/search" element={<Layout><Search /></Layout>} />
        <Route path="/library" element={<Layout><Home /></Layout>} />
        <Route path="/playlists" element={<Layout><Playlists /></Layout>} />
        <Route path="/playlists/:id" element={<Layout><PlaylistDetail /></Layout>} />
        <Route path="/ai" element={<ProtectedRoute><Layout><AIPage /></Layout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminPanel /></Layout></ProtectedRoute>} />
        <Route path="/admin/songs" element={<ProtectedRoute adminOnly><Layout><SongManager /></Layout></ProtectedRoute>} />
        <Route path="/admin/playlists" element={<ProtectedRoute adminOnly><Layout><PlaylistManager /></Layout></ProtectedRoute>} />
      </Routes>
      <PlayerWrapper />
    </BrowserRouter>
  );
}
