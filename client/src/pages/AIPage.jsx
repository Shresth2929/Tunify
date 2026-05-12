import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI, playlistsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import FloatingNotes from '../components/FloatingNotes';
import {
  Sparkles, Brain, Radio, Play, Pause, ListMusic,
  Loader2, ChevronRight, Music, Wand2, Heart,
} from 'lucide-react';

// ── Mood config ────────────────────────────────────────────────────
const MOODS = [
  { id: 'happy',     emoji: '😊', label: 'Happy',     color: '#F59E0B' },
  { id: 'chill',     emoji: '😌', label: 'Chill',     color: '#06B6D4' },
  { id: 'energetic', emoji: '⚡', label: 'Energetic', color: '#EF4444' },
  { id: 'sad',       emoji: '🌧️', label: 'Sad',       color: '#6366F1' },
  { id: 'focus',     emoji: '🎯', label: 'Focus',     color: '#10B981' },
  { id: 'party',     emoji: '🎉', label: 'Party',     color: '#EC4899' },
  { id: 'romance',   emoji: '💕', label: 'Romance',   color: '#F97316' },
  { id: 'workout',   emoji: '💪', label: 'Workout',   color: '#8B5CF6' },
];

// ── Small inline song row ──────────────────────────────────────────
function SongRow({ song, index, queue }) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const { likedSongIds, toggleLike, isAuthenticated } = useAuthStore();
  const isActive = currentSong?._id === song._id;
  const isLiked  = likedSongIds.includes(song._id);

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playSong(song, queue);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    await toggleLike(song._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={handlePlay}
      className="group flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all"
      style={isActive
        ? { background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }
        : { border: '1px solid transparent' }}
    >
      {/* Number / waveform */}
      <div className="w-5 text-center flex-shrink-0">
        {isActive && isPlaying ? (
          <div className="flex gap-[2px] items-end h-4 justify-center">
            {[1, 2, 3].map(b => (
              <div key={b} className="waveform-bar w-[3px] rounded-full" style={{ background: '#F97316' }} />
            ))}
          </div>
        ) : (
          <span className="text-xs text-white/25 group-hover:text-white/50">{index + 1}</span>
        )}
      </div>

      {/* Cover */}
      <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
        <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isActive && isPlaying
            ? <Pause size={12} className="text-white" />
            : <Play size={12} className="text-white ml-0.5" />}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: isActive ? '#F97316' : 'white' }}>
          {song.title}
        </p>
        <p className="text-xs text-white/40 truncate">{song.artist}</p>
      </div>

      {/* Genre pill */}
      <span className="hidden sm:block text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: 'rgba(249,115,22,0.08)', color: 'rgba(249,115,22,0.7)', border: '1px solid rgba(249,115,22,0.15)' }}>
        {song.genre}
      </span>

      {/* Like */}
      <button
        onClick={handleLike}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1"
      >
        <Heart size={13} fill={isLiked ? '#F97316' : 'none'}
          style={{ color: isLiked ? '#F97316' : 'rgba(255,255,255,0.3)' }} />
      </button>
    </motion.div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────
function Section({ icon: Icon, badge, title, subtitle, children, accentColor = '#F97316' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden mb-6"
      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
          <Icon size={17} style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white">{title}</h2>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${accentColor}20`, color: accentColor }}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </motion.section>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AIPage() {
  // Mood Station state
  const [activeMood, setActiveMood]     = useState(null);
  const [moodSongs, setMoodSongs]       = useState([]);
  const [moodLoading, setMoodLoading]   = useState(false);

  // AI Playlist Generator state
  const [prompt, setPrompt]             = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [genLoading, setGenLoading]     = useState(false);
  const [generatedPl, setGeneratedPl]   = useState(null);

  // For You (recommendations) state
  const [recSongs, setRecSongs]         = useState([]);
  const [recLoading, setRecLoading]     = useState(false);
  const [recFetched, setRecFetched]     = useState(false);

  const { playSong } = usePlayerStore();
  const { recentlyPlayed } = usePlayerStore();

  // ── Fetch mood songs ──────────────────────────────────────────
  const fetchMoodSongs = async (mood) => {
    setActiveMood(mood);
    setMoodLoading(true);
    setMoodSongs([]);
    try {
      const res = await aiAPI.getMoodSongs(mood);
      setMoodSongs(res.data.songs || []);
    } catch {
      toast.error('Could not load mood songs. Try again!');
    } finally {
      setMoodLoading(false);
    }
  };

  // ── Generate AI playlist ──────────────────────────────────────
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setGenLoading(true);
    setGeneratedPl(null);
    try {
      const res = await aiAPI.generatePlaylist({ prompt, name: playlistName || undefined });
      setGeneratedPl(res.data.playlist);
      toast.success(`✨ "${res.data.playlist.name}" created!`);
      setPrompt('');
      setPlaylistName('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGenLoading(false);
    }
  };

  // ── Fetch personalized recommendations ───────────────────────
  const fetchRecommendations = async () => {
    setRecLoading(true);
    setRecFetched(true);
    try {
      const recentSongIds = (recentlyPlayed || []).slice(0, 20).map(s => s._id);
      const preferredGenres = [...new Set(
        (recentlyPlayed || []).slice(0, 10).map(s => s.genre).filter(Boolean)
      )];
      const res = await aiAPI.getRecommendations({ recentSongIds, preferredGenres });
      setRecSongs(res.data.songs || []);
    } catch {
      toast.error('Could not load recommendations');
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 relative" style={{ background: '#0D0D0D' }}>
      <FloatingNotes />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Page Header ────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#F97316' }}>
            ✦ AI POWERED
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#F97316,#EC4899)', boxShadow: '0 0 20px rgba(249,115,22,0.4)' }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">AI Mix Studio</h1>
          </div>
          <p className="text-white/40 text-sm mt-2 max-w-lg">
            Powered by AI — generate playlists, discover mood-based music, and get personalized recommendations.
          </p>
        </motion.div>

        {/* ══ 1. MOOD STATION ══════════════════════════════════ */}
        <Section icon={Radio} title="Mood Station" badge="AI Assistant"
          subtitle="Pick a mood and let AI curate the perfect soundtrack" accentColor="#06B6D4">

          {/* Mood Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-5">
            {MOODS.map((m) => (
              <motion.button
                key={m.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchMoodSongs(m.id)}
                disabled={moodLoading}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                style={{
                  background: activeMood === m.id ? `${m.color}20` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeMood === m.id ? m.color + '50' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: activeMood === m.id ? `0 0 16px ${m.color}30` : 'none',
                }}
              >
                <span className="text-xl leading-none">{m.emoji}</span>
                <span className="text-[10px] font-bold" style={{ color: activeMood === m.id ? m.color : 'rgba(255,255,255,0.5)' }}>
                  {m.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {moodLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 text-white/40 py-8 justify-center">
                <Loader2 size={18} className="animate-spin" style={{ color: '#06B6D4' }} />
                <span className="text-sm">AI is curating your {activeMood} playlist…</span>
              </motion.div>
            )}

            {!moodLoading && moodSongs.length > 0 && (
              <motion.div key="songs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                    {moodSongs.length} songs for your {activeMood} mood
                  </p>
                  <button
                    onClick={() => moodSongs[0] && playSong(moodSongs[0], moodSongs)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                    style={{ background: '#06B6D420', color: '#06B6D4', border: '1px solid #06B6D430' }}
                  >
                    <Play size={12} fill="currentColor" /> Play All
                  </button>
                </div>
                <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1">
                  {moodSongs.map((song, i) => (
                    <SongRow key={song._id} song={song} index={i} queue={moodSongs} />
                  ))}
                </div>
              </motion.div>
            )}

            {!moodLoading && !activeMood && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-8 text-white/20">
                <Radio size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select a mood above to get started</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ══ 2. AI PLAYLIST GENERATOR ═════════════════════════ */}
        <Section icon={Wand2} title="AI Playlist Generator" badge="AI Assistant"
          subtitle="Describe a vibe and AI will build a custom playlist for you" accentColor="#F97316">

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
                Describe your vibe *
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder='e.g. "late night drive through a rainy city", "coding at 2am", "Sunday morning coffee vibes"…'
                rows={3}
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none resize-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
                Playlist name (optional)
              </label>
              <input
                type="text"
                value={playlistName}
                onChange={e => setPlaylistName(e.target.value)}
                placeholder="Leave blank for AI to name it"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <button
              type="submit"
              disabled={genLoading || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: genLoading ? 'none' : '0 8px 24px rgba(249,115,22,0.3)' }}
            >
              {genLoading
                ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
                : <><Sparkles size={16} /> Generate Playlist</>}
            </button>
          </form>

          {/* Generated playlist result */}
          <AnimatePresence>
            {generatedPl && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 p-4 rounded-xl flex items-center gap-4"
                style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)' }}
              >
                <img
                  src={generatedPl.coverUrl}
                  alt={generatedPl.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#F97316' }}>
                    ✨ AI Created
                  </p>
                  <p className="text-white font-bold text-sm truncate">{generatedPl.name}</p>
                  <p className="text-white/40 text-xs">{generatedPl.songs?.length || 0} songs</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => generatedPl.songs?.[0] && playSong(generatedPl.songs[0], generatedPl.songs)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 0 16px rgba(249,115,22,0.4)' }}
                  >
                    <Play size={15} fill="white" className="text-white ml-0.5" />
                  </button>
                  <Link
                    to={`/playlists/${generatedPl._id}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <ChevronRight size={15} className="text-white/60" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ══ 3. FOR YOU ═══════════════════════════════════════ */}
        <Section icon={Brain} title="For You" badge="Personalized"
          subtitle="AI recommendations based on your listening history and liked songs" accentColor="#8B5CF6">

          {!recFetched ? (
            <div className="text-center py-8">
              <Music size={36} className="mx-auto mb-3 opacity-20 text-white" />
              <p className="text-white/40 text-sm mb-4">
                {recentlyPlayed?.length > 0
                  ? `Based on ${Math.min(recentlyPlayed.length, 20)} recently played songs`
                  : 'Play some songs to get personalized recommendations'}
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={fetchRecommendations}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white mx-auto transition-all"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}
              >
                <Brain size={16} /> Get My Recommendations
              </motion.button>
            </div>
          ) : recLoading ? (
            <div className="flex items-center gap-3 text-white/40 py-8 justify-center">
              <Loader2 size={18} className="animate-spin" style={{ color: '#8B5CF6' }} />
              <span className="text-sm">AI is analyzing your taste…</span>
            </div>
          ) : recSongs.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                  {recSongs.length} personalized picks
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => recSongs[0] && playSong(recSongs[0], recSongs)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                    style={{ background: '#8B5CF620', color: '#8B5CF6', border: '1px solid #8B5CF630' }}
                  >
                    <Play size={12} fill="currentColor" /> Play All
                  </button>
                  <button
                    onClick={fetchRecommendations}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Refresh
                  </button>
                </div>
              </div>
              <div className="space-y-0.5">
                {recSongs.map((song, i) => (
                  <SongRow key={song._id} song={song} index={i} queue={recSongs} />
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-8 text-white/30">
              <p className="text-sm">No recommendations yet — play more songs!</p>
              <button onClick={() => setRecFetched(false)} className="text-xs mt-2 underline opacity-50">Reset</button>
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}
