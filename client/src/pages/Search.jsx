import { useState, useEffect } from 'react';
import { songsAPI } from '../services/api';
import SongCard from '../components/SongCard';
import { Search as SearchIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingNotes from '../components/FloatingNotes';



export default function Search() {
  const [query, setQuery]     = useState('');
  const [songs, setSongs]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setSongs([]); setSearched(false); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await songsAPI.getAll({ search: query, limit: 30 });
        setSongs(res.data.songs);
        setSearched(true);
      } catch { setSongs([]); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="flex-1 overflow-y-auto pb-28 px-6 pt-8 relative" style={{ background: '#0D0D0D' }}>

      {/* Floating notes */}
      <FloatingNotes />

      <div className="relative z-10">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#F97316' }}>◈ DISCOVER</p>
          <h1 className="text-3xl font-black text-white tracking-tighter">Search</h1>
        </div>

        {/* Search bar */}
        <div className="relative max-w-xl mb-8">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(249,115,22,0.6)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="input-field pl-11 pr-10 text-base py-3"
            style={{ boxShadow: query ? '0 0 0 1px rgba(249,115,22,0.3), 0 0 20px rgba(249,115,22,0.1)' : 'none' }}
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Spinner */}
        {loading && (
          <div className="flex items-center gap-3 text-white/50 mb-4">
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'rgba(249,115,22,0.3)', borderTopColor: '#F97316' }} />
            Searching...
          </div>
        )}

        {searched && !loading && (
          <p className="text-white/40 text-sm mb-4">
            <span style={{ color: '#F97316' }}>{songs.length}</span> result{songs.length !== 1 ? 's' : ''} for "{query}"
          </p>
        )}

        {songs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {songs.map((song, i) => (
              <SongCard key={song._id} song={song} queue={songs} index={i} />
            ))}
          </div>
        )}

        {searched && !loading && songs.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <SearchIcon size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-lg">No results found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-20 text-white/20">
            <div className="text-6xl mb-4" style={{ color: 'rgba(249,115,22,0.15)' }}>♪</div>
            <p className="text-lg">Start typing to find music</p>
          </div>
        )}
      </div>
    </div>
  );
}
