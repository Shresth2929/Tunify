import { Play, Pause, Heart, Clock, Plus } from 'lucide-react';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import AddToPlaylistModal from './AddToPlaylistModal';

const formatDuration = (secs) => {
  if (!secs) return '--:--';
  return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
};

export default function SongCard({ song, queue, index, compact = false }) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const { isAuthenticated, likedSongIds, toggleLike } = useAuthStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const isActive = currentSong?._id === song._id;
  const isLiked  = likedSongIds.includes(song._id);

  const handlePlay = (e) => {
    if (e.target.closest('.add-btn') || e.target.closest('.like-btn')) return;
    if (!isAuthenticated) { toast.error('Please sign in to play music!'); return; }
    if (isActive) togglePlay();
    else playSong(song, queue);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please sign in to manage playlists!'); return; }
    setIsAddModalOpen(true);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please sign in to like songs!'); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      await toggleLike(song._id);
      toast(isLiked ? '💔 Removed from liked songs' : '❤️ Added to liked songs', {
        style: { background: '#1A1A1A', color: '#fff', border: '1px solid rgba(249,115,22,0.3)' },
      });
    } finally {
      setLikeLoading(false);
    }
  };

  if (compact) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          onClick={handlePlay}
          className={`song-row group ${isActive ? 'border' : ''}`}
          style={isActive ? { background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.2)' } : {}}
        >
          <span className={`text-sm w-5 text-center flex-shrink-0 ${isActive ? '' : 'text-white/30'}`}
            style={isActive ? { color: '#F97316' } : {}}>
            {isActive && isPlaying ? (
              <div className="flex gap-0.5 items-end h-4 justify-center">
                {[1,2,3].map(i => <div key={i} className="w-0.5 rounded-full animate-bounce" style={{ height: `${40+i*20}%`, animationDelay: `${i*0.1}s`, background: '#F97316' }} />)}
              </div>
            ) : (index + 1)}
          </span>
          <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${isActive ? '' : 'text-white'}`}
              style={isActive ? { color: '#FB923C' } : {}}>{song.title}</p>
            <p className="text-white/50 text-xs truncate">{song.artist}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs flex-shrink-0">{formatDuration(song.duration)}</span>
            {/* Like button */}
            <button
              onClick={handleLike}
              className="like-btn p-1.5 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <AnimatePresence mode="wait">
                <motion.div key={isLiked ? 'liked' : 'unliked'} initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}>
                  <Heart size={14} fill={isLiked ? '#F97316' : 'none'} style={{ color: isLiked ? '#F97316' : 'rgba(255,255,255,0.3)' }} />
                </motion.div>
              </AnimatePresence>
            </button>
            {/* Add to playlist */}
            <button
              onClick={handleAddClick}
              className="add-btn p-1.5 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-primary-500"
            >
              <Plus size={14} />
            </button>
          </div>
        </motion.div>
        <AddToPlaylistModal song={song} isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`glass-card p-4 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer group relative`}
        style={isActive ? { boxShadow: '0 0 0 1px rgba(249,115,22,0.4), 0 0 20px rgba(249,115,22,0.1)' } : {}}
        onClick={handlePlay}
      >
        <div className="relative mb-3">
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full aspect-square object-cover rounded-xl"
          />
          <div className={`absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 0 20px rgba(249,115,22,0.5)' }}>
              {isActive && isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
            </div>
          </div>
          {/* Add to playlist */}
          <button
            onClick={handleAddClick}
            className="add-btn absolute top-2 left-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-primary-500 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
          >
            <Plus size={16} />
          </button>
          {/* Like button */}
          <button
            onClick={handleLike}
            className="like-btn absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: isLiked ? 'rgba(249,115,22,0.25)' : 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
            }}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <AnimatePresence mode="wait">
              <motion.div key={isLiked ? 'liked' : 'unliked'} initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0.6 }}>
                <Heart size={14} fill={isLiked ? '#F97316' : 'none'} style={{ color: isLiked ? '#F97316' : 'rgba(255,255,255,0.6)' }} />
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
        <p className={`font-semibold text-sm truncate ${isActive ? '' : 'text-white'}`}
          style={isActive ? { color: '#FB923C' } : {}}>{song.title}</p>
        <p className="text-white/50 text-xs truncate mt-0.5">{song.artist}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-white/30 text-xs truncate max-w-[60%]">{song.album}</span>
          <span className="text-white/30 text-xs flex items-center gap-1">
            <Clock size={10} /> {formatDuration(song.duration)}
          </span>
        </div>
      </motion.div>
      <AddToPlaylistModal song={song} isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  );
}
