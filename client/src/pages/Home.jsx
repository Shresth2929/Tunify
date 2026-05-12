import { useEffect, useState, useRef, useCallback } from 'react';
import { songsAPI, playlistsAPI } from '../services/api';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Play, Pause, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import FloatingNotes from '../components/FloatingNotes';

const genres = ['Lo-Fi', 'Techno', 'Jazz', 'R&B', 'Rock', 'HipHop'];

const FEATURED_CARDS = [
  { id: 1, title: 'Echoes of Midnight', artist: 'Jon Hickman',  genre: 'Electronic', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
  { id: 2, title: 'Ethereal Waves',     artist: 'Luna Atlas',   genre: 'Pop',        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop' },
  { id: 3, title: 'Soul Frequency',     artist: 'Marcus Veil',  genre: 'R&B',        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop' },
  { id: 4, title: 'Neon Pulse',         artist: 'Vortex Sound', genre: 'Rock',       image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop' },
  { id: 5, title: 'City of Glass',      artist: 'Aria Nova',    genre: 'Lo-Fi',      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop' },
];



export default function Home() {
  const [songs, setSongs]           = useState([]);
  const [activeGenre, setActiveGenre] = useState('Lo-Fi');
  const [loading, setLoading]       = useState(true);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  const { currentSong, isPlaying, playSong } = usePlayerStore();
  const { user, isAuthenticated, likedSongIds, toggleLike } = useAuthStore();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeCard, setActiveCard]           = useState(2);
  const [direction, setDirection]             = useState(0);
  const autoTimer = useRef(null);

  // ── Auto-slide every 3.5s, pause on hover ──────────────────
  const goNext = useCallback(() => {
    setDirection(1);
    setActiveCard(i => (i + 1) % FEATURED_CARDS.length);
  }, []);

  const goPrev = () => {
    setDirection(-1);
    setActiveCard(i => (i - 1 + FEATURED_CARDS.length) % FEATURED_CARDS.length);
  };

  useEffect(() => {
    if (isHoveringCarousel) {
      clearInterval(autoTimer.current);
      return;
    }
    autoTimer.current = setInterval(goNext, 2000);
    return () => clearInterval(autoTimer.current);
  }, [isHoveringCarousel, goNext]);

  // ── Data fetch ─────────────────────────────────────────────
  useEffect(() => {
    songsAPI.getAll({ limit: 50, sort: '-plays' })
      .then(r => setSongs(r.data.songs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePlaySong = (song, queue) => {
    if (!isAuthenticated) return toast.error('Please sign in to play music!');
    playSong(song, queue);
  };

  const handlePlayFeatured = (fallbackGenre) => {
    if (!isAuthenticated) return toast.error('Please sign in to play music!');
    const target = songs.find(s => s.genre === fallbackGenre) || songs[0];
    if (target) playSong(target, songs);
  };

  // Genre-filtered songs (case-insensitive)
  const genreSongs = songs.filter(s =>
    s.genre?.toLowerCase() === activeGenre.toLowerCase()
  );
  // Fallback: show top 5 from all songs if no genre match
  const displayedSongs = genreSongs.length > 0 ? genreSongs.slice(0, 5) : songs.slice(0, 5);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#0D0D0D' }}>
        <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(249,115,22,0.2)', borderTopColor: '#F97316' }} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-32 relative" style={{ background: '#0D0D0D' }}>

      {/* ── Floating music notes background ───────────────────── */}
      <FloatingNotes />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#F97316' }}>01* STREAM</p>
            <h1 className="text-3xl font-black text-white tracking-tighter">Discover Your Sound</h1>
          </div>

          {!user ? (
            <Link to="/login" className="btn-primary">Sign In</Link>
          ) : (
            <div className="relative">
              <div
                onClick={() => setShowProfileMenu(v => !v)}
                className="flex items-center gap-3 rounded-full pl-2 pr-4 py-1.5 cursor-pointer transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(249,115,22,0.2)' }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#F97316,#EC4899)' }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white/80">{user.username}</span>
                <ChevronDown size={14} className="text-white/40" />
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden z-50"
                  style={{ background: '#1A1A1A', border: '1px solid rgba(249,115,22,0.15)' }}>
                  <button className="w-full text-left px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                    Change Password
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* ── Featured Releases carousel ─────────────────────── */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center justify-between mb-5"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: '#F97316' }}>▶▶▶ NOW FEATURED</p>
              <h2 className="text-lg font-black text-white tracking-tight">Featured Releases</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={goPrev}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 text-white/40 hover:text-white"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={goNext}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 text-white/40 hover:text-white"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>

          {/* Carousel */}
          <div
            className="relative flex items-center justify-center"
            style={{ height: '340px' }}
            onMouseEnter={() => setIsHoveringCarousel(true)}
            onMouseLeave={() => setIsHoveringCarousel(false)}
          >
            {FEATURED_CARDS.map((card, i) => {
              const offset    = i - activeCard;
              const absOffset = Math.abs(offset);
              if (absOffset > 2) return null;

              const isActive   = offset === 0;
              const isAdjacent = absOffset === 1;
              const xPercent   = offset * 62;
              const scale      = isActive ? 1 : isAdjacent ? 0.78 : 0.62;
              const opacity    = isActive ? 1 : isAdjacent ? 0.6 : 0.3;
              const zIndex     = isActive ? 30 : isAdjacent ? 20 : 10;
              const blur       = isActive ? 0 : isAdjacent ? 0 : 2;

              return (
                <motion.div
                  key={card.id}
                  onClick={() => {
                    if (!isActive) { setDirection(offset > 0 ? 1 : -1); setActiveCard(i); }
                    else handlePlayFeatured(card.genre);
                  }}
                  animate={{ x: `${xPercent}%`, scale, opacity, zIndex, filter: `blur(${blur}px)` }}
                  initial={false}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute cursor-pointer group"
                  style={{ width: '260px', height: '320px', transformOrigin: 'center center' }}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-3xl blur-2xl scale-95 -z-10"
                      style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.35) 0%, rgba(236,72,153,0.15) 60%, transparent 100%)' }} />
                  )}

                  <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                    <img src={card.image} alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    {isActive && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, transparent 60%, rgba(236,72,153,0.05) 100%)' }} />
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                      <div>
                        <h3 className="text-white font-bold text-base leading-tight mb-0.5 drop-shadow-lg">{card.title}</h3>
                        <p className="text-white/60 text-sm font-medium">{card.artist}</p>
                      </div>
                      {isActive && (
                        <motion.button
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }}
                          onClick={(e) => { e.stopPropagation(); handlePlayFeatured(card.genre); }}
                          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-transform hover:scale-110"
                          style={{ background: 'rgba(249,115,22,0.25)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(249,115,22,0.5)', boxShadow: '0 4px 24px rgba(249,115,22,0.5)' }}
                        >
                          <Play size={16} fill="white" className="text-white ml-0.5" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {FEATURED_CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > activeCard ? 1 : -1); setActiveCard(i); }}
                className="rounded-full transition-all duration-300"
                style={i === activeCard
                  ? { width: '20px', height: '6px', background: 'linear-gradient(90deg,#F97316,#EC4899)', boxShadow: '0 0 8px rgba(249,115,22,0.6)' }
                  : { width: '6px', height: '6px', background: 'rgba(255,255,255,0.15)' }}
              />
            ))}
          </div>
        </section>

        {/* ── Explore Genres ─────────────────────────────────── */}
        <section className="mb-8">
          <div className="flex items-baseline gap-3 mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#F97316' }}>◈ BROWSE</p>
            <h2 className="text-lg font-black text-white tracking-tight">Explore Genres</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={activeGenre === g
                  ? { background: 'linear-gradient(135deg,#F97316,#EA580C)', color: 'white', boxShadow: '0 0 18px rgba(249,115,22,0.5)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* ── Genre Songs ────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline gap-3 mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#F97316' }}>⊕ TOP</p>
            <h2 className="text-lg font-black text-white tracking-tight">
              {genreSongs.length > 0 ? `${activeGenre} Tracks` : 'Popular Tracks'}
            </h2>
            {genreSongs.length === 0 && (
              <span className="text-[10px] text-white/30 font-medium ml-1">(showing all — no {activeGenre} songs yet)</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {displayedSongs.map((song, i) => {
              const isActive      = currentSong?._id === song._id;
              const isPlayingThis = isActive && isPlaying;
              return (
                <div
                  key={song._id}
                  onClick={() => handlePlaySong(song, displayedSongs)}
                  className="group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200"
                  style={isActive
                    ? { background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }
                    : { border: '1px solid transparent' }}
                >
                  {/* Number / waveform */}
                  <div className="w-5 flex items-center justify-center flex-shrink-0">
                    {isPlayingThis ? (
                      <div className="flex items-end gap-[2px] h-4">
                        {[1,2,3].map(b => (
                          <div key={b} className="waveform-bar w-[3px] rounded-full" style={{ background: '#F97316' }} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/25 text-xs font-mono group-hover:text-white/50 transition-colors">{i + 1}</span>
                    )}
                  </div>

                  {/* Album art */}
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={song.coverUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isPlayingThis ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white ml-0.5" />}
                    </div>
                  </div>

                  {/* Title + artist */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate transition-colors"
                      style={{ color: isActive ? '#F97316' : 'white' }}>{song.title}</h4>
                    <p className="text-xs text-white/40 truncate">{song.artist}</p>
                  </div>

                  {/* Genre badge */}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:block"
                    style={{ background: 'rgba(249,115,22,0.1)', color: 'rgba(249,115,22,0.8)', border: '1px solid rgba(249,115,22,0.2)' }}>
                    {song.genre}
                  </span>

                  {/* Duration + Like */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-white/25 group-hover:text-white/50 transition-colors tabular-nums">
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={async (e) => { e.stopPropagation(); if (!isAuthenticated) return toast.error('Sign in to like songs'); await toggleLike(song._id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Heart size={14}
                        fill={likedSongIds?.includes(song._id) ? '#F97316' : 'none'}
                        style={{ color: likedSongIds?.includes(song._id) ? '#F97316' : 'rgba(255,255,255,0.3)' }}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
