import { Link, useLocation } from 'react-router-dom';
import { Music2, Home, Search, ListMusic, Shield, LogOut, X, Radio, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import usePlayerStore from '../store/playerStore';

const navLinks = [
  { to: '/',         icon: Home,      label: 'Home' },
  { to: '/search',   icon: Search,    label: 'Search' },
  { to: '/playlists',icon: ListMusic, label: 'Playlists' },
  { to: '/ai',       icon: Sparkles,  label: 'AI Mix', authOnly: true },
];

export default function Sidebar({ onClose }) {
  const { pathname } = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  return (
    <aside
      className="w-64 flex-shrink-0 h-full flex flex-col relative"
      style={{ background: '#0D0D0D', borderRight: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Orange top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 via-accent-500 to-transparent" />

      {/* Logo */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', boxShadow: '0 0 16px rgba(249,115,22,0.5)' }}
          >
            <Music2 size={18} className="text-white" />
          </div>
          <span
            className="text-xl font-black tracking-tight"
            style={{ background: 'linear-gradient(135deg, #FB923C, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Tunify
          </span>
        </div>
        <button onClick={onClose} className="md:hidden text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] px-4 pb-2">Menu</p>
        {navLinks.filter(l => !l.authOnly || isAuthenticated).map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={`sidebar-link ${pathname === to ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}

        {user?.role === 'admin' && (
          <>
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] px-4 pb-2 pt-5">Admin</p>
            <Link
              to="/admin"
              onClick={onClose}
              className={`sidebar-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
            >
              <Shield size={17} />
              <span className="text-sm font-medium">Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* Now Playing mini card */}
      {currentSong && (
        <div
          className="mx-3 mb-3 p-3 rounded-xl relative overflow-hidden"
          style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <img src={currentSong.coverUrl} className="w-9 h-9 rounded-lg object-cover" alt="" />
              {isPlaying && (
                <div className="absolute -bottom-1 -right-1 flex gap-[2px] items-end h-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="waveform-bar w-[3px] rounded-full" style={{ background: '#F97316' }} />
                  ))}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">{currentSong.title}</p>
              <p className="text-white/40 text-[10px] truncate">{currentSong.artist}</p>
            </div>
            <Radio size={12} className="text-primary-500 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* User section */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.username}</p>
                <p className="text-xs capitalize" style={{ color: '#F97316' }}>{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-white/25 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary w-full justify-center text-sm">
            Sign In
          </Link>
        )}
      </div>
    </aside>
  );
}
