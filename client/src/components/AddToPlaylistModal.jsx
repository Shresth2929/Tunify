import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Music, Check } from 'lucide-react';
import { playlistsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

export default function AddToPlaylistModal({ song, isOpen, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      playlistsAPI.getMyPlaylists()
        .then(res => setPlaylists(res.data.playlists))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleAdd = async (playlistId) => {
    try {
      await playlistsAPI.addSongs(playlistId, [song._id]);
      toast.success(`Added to playlist!`);
      onClose();
    } catch (err) {
      toast.error('Already in playlist or failed to add');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-primary-500" /> Add to Playlist
              </h3>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : playlists.length === 0 ? (
                <div className="p-8 text-center">
                  <Music size={32} className="mx-auto mb-3 opacity-20 text-white" />
                  <p className="text-sm text-white/40">No playlists yet</p>
                  <button 
                    onClick={() => { onClose(); window.location.href='/playlists'; }}
                    className="mt-4 text-xs font-bold text-primary-500 uppercase tracking-wider"
                  >
                    Create one first
                  </button>
                </div>
              ) : (
                playlists.map((pl) => (
                  <button
                    key={pl._id}
                    onClick={() => handleAdd(pl._id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                  >
                    <img src={pl.coverUrl} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{pl.name}</p>
                      <p className="text-xs text-white/40">{pl.songs?.length || 0} songs</p>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary-500/50 transition-colors">
                      <Plus size={14} className="text-white/20 group-hover:text-primary-500" />
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div className="p-4 bg-white/[0.02] border-t border-white/5">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-primary-500/10 border border-primary-500/20">
                <img src={song.coverUrl} className="w-8 h-8 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{song.title}</p>
                  <p className="text-[10px] text-primary-500/70 truncate">{song.artist}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
