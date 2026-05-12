import { useEffect, useState } from 'react';
import { playlistsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { ListMusic, Play, Plus, X, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import FloatingNotes from '../components/FloatingNotes';
import { toast } from 'react-hot-toast';

export default function Playlists() {
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  
  const { playSong } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();

  const fetchPlaylists = async () => {
    try {
      const publicRes = await playlistsAPI.getAll();
      setPublicPlaylists(publicRes.data.playlists);
      
      if (isAuthenticated) {
        const myRes = await playlistsAPI.getMyPlaylists();
        setMyPlaylists(myRes.data.playlists);
      }
    } catch (err) {
      console.error('Error fetching playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [isAuthenticated]);

  const [creating, setCreating] = useState(false);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    setCreating(true);
    try {
      await playlistsAPI.create({ 
        name: newPlaylistName, 
        description: newPlaylistDesc,
        isPublic: false 
      });
      toast.success('Playlist created!');
      setIsModalOpen(false);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      await fetchPlaylists();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#0D0D0D' }}>
      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'rgba(249,115,22,0.2)', borderTopColor: '#F97316' }} />
    </div>
  );

  const PlaylistGrid = ({ title, items, icon: Icon, showCreate = false }) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {Icon && <Icon size={20} style={{ color: '#F97316' }} />} {title}
        </h2>
        {showCreate && isAuthenticated && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', border: '1px solid rgba(249,115,22,0.2)' }}
          >
            <Plus size={16} /> Create Playlist
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-white/30">
          <Music size={40} className="mb-3 opacity-20" />
          <p className="text-sm">No playlists found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((pl, i) => (
            <motion.div
              key={pl._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={`/playlists/${pl._id}`}>
                <div
                  className="p-4 rounded-2xl cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: '#141414',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(249,115,22,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="relative mb-3">
                    <img src={pl.coverUrl} alt={pl.name} className="w-full aspect-square object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => { e.preventDefault(); if (pl.songs?.[0]) playSong(pl.songs[0], pl.songs); }}
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 0 20px rgba(249,115,22,0.6)' }}
                      >
                        <Play size={20} fill="white" className="ml-0.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-white font-bold truncate text-sm">{pl.name}</p>
                  <p className="text-white/40 text-xs mt-1">{pl.songs?.length || 0} songs</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-28 px-6 pt-8 relative" style={{ background: '#0D0D0D' }}>
      <FloatingNotes />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#F97316' }}>◈ LIBRARY</p>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <ListMusic style={{ color: '#F97316' }} size={32} /> Your Collection
          </h1>
        </div>

        {isAuthenticated && (
          <PlaylistGrid title="My Playlists" items={myPlaylists} icon={Music} showCreate />
        )}
        
        <PlaylistGrid title="Featured Playlists" items={publicPlaylists} icon={Play} />
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-black text-white mb-6">Create Playlist</h2>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Name</label>
                  <input 
                    type="text"
                    required
                    value={newPlaylistName}
                    onChange={e => setNewPlaylistName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="My Awesome Playlist"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Description</label>
                  <textarea 
                    value={newPlaylistDesc}
                    onChange={e => setNewPlaylistDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors h-24 resize-none"
                    placeholder="What's this playlist about?"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={creating}
                  className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 10px 30px rgba(249,115,22,0.3)' }}
                >
                  {creating ? 'Creating...' : 'Create Now'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
