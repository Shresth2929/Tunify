import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistsAPI, songsAPI } from '../services/api';
import SongCard from '../components/SongCard';
import {
  Play, Shuffle, ListMusic, Trash2, X, Plus,
  Search, ChevronDown, ChevronUp, Pencil, Globe,
  Lock, Check, AlertTriangle,
} from 'lucide-react';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

/* ─── tiny helpers ─────────────────────────────────────────────── */
const ModalBackdrop = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
  />
);

/* ─── Edit Modal ────────────────────────────────────────────────── */
function EditPlaylistModal({ playlist, onClose, onSaved }) {
  const [name, setName]         = useState(playlist.name);
  const [desc, setDesc]         = useState(playlist.description || '');
  const [isPublic, setIsPublic] = useState(playlist.isPublic);
  const [saving, setSaving]     = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await playlistsAPI.update(playlist._id, { name, description: desc, isPublic });
      toast.success('Playlist updated!');
      onSaved(res.data.playlist);
      onClose();
    } catch {
      toast.error('Failed to update playlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <ModalBackdrop onClose={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#1A1A1A', border: '1px solid rgba(249,115,22,0.2)' }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <Pencil size={18} style={{ color: '#F97316' }} />
            <h2 className="text-lg font-black text-white">Edit Playlist</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none resize-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              placeholder="What's this playlist about?"
            />
          </div>

          {/* public toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Visibility</label>
            <div className="flex gap-3">
              {[
                { val: false, Icon: Lock,  label: 'Private', desc: 'Only you can see it' },
                { val: true,  Icon: Globe, label: 'Public',  desc: 'Everyone can see it' },
              ].map(({ val, Icon, label, desc: d }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setIsPublic(val)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-sm font-bold"
                  style={{
                    background: isPublic === val ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)',
                    borderColor: isPublic === val ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)',
                    color: isPublic === val ? '#F97316' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  <span className="text-[10px] font-normal opacity-60">{d}</span>
                </button>
              ))}
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-white/50 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 8px 24px rgba(249,115,22,0.3)' }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Check size={16} /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Delete Confirm Modal ──────────────────────────────────────── */
function DeleteConfirmModal({ playlistName, onConfirm, onClose, deleting }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <ModalBackdrop onClose={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center"
        style={{ background: '#1A1A1A', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={26} className="text-red-500" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Delete Playlist?</h2>
        <p className="text-white/40 text-sm mb-6">
          <span className="text-white/70 font-semibold">"{playlistName}"</span> will be permanently deleted.
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-white/50 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 8px 24px rgba(239,68,68,0.3)' }}
          >
            {deleting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Trash2 size={16} /> Delete</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
export default function PlaylistDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [playlist, setPlaylist]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  // Add-songs panel
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [allSongs, setAllSongs]         = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [addingId, setAddingId]         = useState(null);

  const { playSong }        = usePlayerStore();
  const { user }            = useAuthStore();
  const userId              = user?._id || user?.id;
  const isOwner             = playlist
    ? (playlist.createdBy === userId ||
       (typeof playlist.createdBy === 'object' && playlist.createdBy?._id === userId) ||
       user?.role === 'admin')
    : false;

  /* fetch playlist */
  const fetchPlaylist = () => {
    playlistsAPI.getById(id)
      .then(res  => setPlaylist(res.data.playlist))
      .catch(()  => toast.error('Failed to load playlist'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchPlaylist(); }, [id]);

  /* fetch songs when add panel opens */
  useEffect(() => {
    if (showAddPanel && allSongs.length === 0) {
      setSongsLoading(true);
      songsAPI.getAll()
        .then(res  => setAllSongs(res.data.songs || []))
        .catch(()  => toast.error('Failed to load songs'))
        .finally(() => setSongsLoading(false));
    }
  }, [showAddPanel]);

  /* handlers */
  const handleDeletePlaylist = async () => {
    setDeleting(true);
    try {
      await playlistsAPI.delete(id);
      toast.success('Playlist deleted');
      navigate('/playlists');
    } catch {
      toast.error('Failed to delete playlist');
      setDeleting(false);
    }
  };

  const handleRemoveSong = async (song) => {
    try {
      await playlistsAPI.removeSong(id, song._id);
      fetchPlaylist();
      toast.success(`"${song.title}" removed`, { icon: '🗑️' });
    } catch {
      toast.error('Failed to remove song');
    }
  };

  const handleAddSong = async (songId) => {
    setAddingId(songId);
    try {
      await playlistsAPI.addSongs(id, [songId]);
      toast.success('Song added!', { icon: '🎵' });
      fetchPlaylist();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add song');
    } finally {
      setAddingId(null);
    }
  };

  /* loading / not found states */
  if (loading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#0D0D0D' }}>
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'rgba(249,115,22,0.2)', borderTopColor: '#F97316' }} />
    </div>
  );
  if (!playlist) return (
    <div className="flex-1 flex items-center justify-center text-white/40" style={{ background: '#0D0D0D' }}>
      Playlist not found
    </div>
  );

  const songs          = playlist.songs || [];
  const existingIds    = new Set(songs.map(s => s._id));
  const filteredSongs  = allSongs.filter(s =>
    !existingIds.has(s._id) &&
    (s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto pb-28" style={{ background: '#0D0D0D' }}>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showEditModal && (
          <EditPlaylistModal
            playlist={playlist}
            onClose={() => setShowEditModal(false)}
            onSaved={(updated) => setPlaylist(p => ({ ...p, ...updated }))}
          />
        )}
        {showDeleteModal && (
          <DeleteConfirmModal
            playlistName={playlist.name}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeletePlaylist}
            deleting={deleting}
          />
        )}
      </AnimatePresence>

      {/* ── Hero Header ── */}
      <div className="relative px-6 py-10 flex flex-col md:flex-row gap-8 items-center md:items-end">
        {/* blurred backdrop */}
        <div className="absolute inset-0 overflow-hidden">
          <img src={playlist.coverUrl} alt="" className="w-full h-full object-cover blur-3xl opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0D0D0D]" />
        </div>

        {/* cover */}
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          src={playlist.coverUrl}
          alt={playlist.name}
          className="relative w-48 h-48 rounded-2xl object-cover shadow-2xl flex-shrink-0"
        />

        {/* info */}
        <div className="relative flex-1 text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#F97316' }}>
            {playlist.isPublic ? '◈ PUBLIC PLAYLIST' : '◈ PRIVATE PLAYLIST'}
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-1">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-white/50 mb-2 line-clamp-2 max-w-xl text-sm">{playlist.description}</p>
          )}
          <p className="text-white/30 text-sm">{songs.length} song{songs.length !== 1 ? 's' : ''}</p>

          {/* action buttons */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
            {/* Play All */}
            <button
              onClick={() => songs[0] && playSong(songs[0], songs)}
              className="flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 10px 20px rgba(249,115,22,0.3)' }}
            >
              <Play size={18} fill="white" /> Play All
            </button>

            {/* Shuffle */}
            <button
              onClick={() => {
                if (!songs.length) return;
                const s = [...songs].sort(() => Math.random() - 0.5);
                playSong(s[0], s);
              }}
              className="flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Shuffle size={18} /> Shuffle
            </button>

            {/* Owner-only controls */}
            {isOwner && (
              <>
                {/* Add Songs toggle */}
                <button
                  onClick={() => setShowAddPanel(v => !v)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: showAddPanel ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.08)',
                    color: '#F97316',
                    border: '1px solid rgba(249,115,22,0.3)',
                  }}
                >
                  <Plus size={18} />
                  Add Songs
                  {showAddPanel ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => setShowEditModal(true)}
                  title="Edit Playlist"
                  className="flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Pencil size={16} /> Edit
                </button>

                {/* Delete */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  title="Delete Playlist"
                  className="flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Songs Panel ── */}
      <AnimatePresence>
        {showAddPanel && isOwner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mx-6 mb-6 rounded-2xl overflow-hidden"
              style={{ background: '#141414', border: '1px solid rgba(249,115,22,0.15)' }}>

              {/* panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F97316' }}>
                  Add Songs
                </span>
                <button onClick={() => setShowAddPanel(false)} className="text-white/30 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {/* search */}
              <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Search size={15} style={{ color: '#F97316' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by title or artist…"
                    autoFocus
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* results */}
              <div className="max-h-72 overflow-y-auto">
                {songsLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: 'rgba(249,115,22,0.2)', borderTopColor: '#F97316' }} />
                  </div>
                ) : filteredSongs.length === 0 ? (
                  <div className="text-center py-10 text-white/30 text-sm">
                    {searchQuery ? 'No songs match your search' : 'All library songs are already in this playlist!'}
                  </div>
                ) : (
                  filteredSongs.map(song => (
                    <div key={song._id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                      <img src={song.coverUrl} alt={song.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{song.title}</p>
                        <p className="text-white/40 text-xs truncate">{song.artist}</p>
                      </div>
                      <button
                        onClick={() => handleAddSong(song._id)}
                        disabled={addingId === song._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        style={{ background: 'rgba(249,115,22,0.12)', color: '#F97316', border: '1px solid rgba(249,115,22,0.25)' }}
                      >
                        {addingId === song._id
                          ? <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin"
                              style={{ borderColor: 'rgba(249,115,22,0.3)', borderTopColor: '#F97316' }} />
                          : <><Plus size={12} /> Add</>}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Song List ── */}
      <div className="px-6 mt-2">
        {/* section label */}
        {songs.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">
              {songs.length} Song{songs.length !== 1 ? 's' : ''}
            </p>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        )}

        {songs.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed"
            style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <ListMusic size={48} className="mx-auto mb-4 opacity-10 text-white" />
            <p className="text-white/40 mb-1">No songs yet</p>
            <p className="text-white/20 text-sm mb-5">This playlist is empty</p>
            {isOwner && (
              <button
                onClick={() => { setShowAddPanel(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(249,115,22,0.12)', color: '#F97316', border: '1px solid rgba(249,115,22,0.3)' }}
              >
                + Add your first song
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {songs.map((song, i) => (
              <div key={song._id} className="relative group">
                <SongCard song={song} queue={songs} index={i} compact />
                {/* remove button — only for owner */}
                {isOwner && (
                  <button
                    onClick={() => handleRemoveSong(song)}
                    title="Remove from playlist"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg
                      flex items-center justify-center
                      opacity-0 group-hover:opacity-100
                      text-white/30 hover:text-red-400 hover:bg-red-500/10
                      transition-all duration-200 z-10"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
