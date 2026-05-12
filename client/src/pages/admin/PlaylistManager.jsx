import { useEffect, useState } from 'react';
import { playlistsAPI, songsAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Music2, Loader, Search, CheckSquare, Square } from 'lucide-react';

const emptyForm = { name: '', description: '', isPublic: true };

export default function PlaylistManager() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Song picker
  const [showSongPicker, setShowSongPicker] = useState(false);
  const [targetPlaylist, setTargetPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [songSearch, setSongSearch] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await playlistsAPI.getAll();
      setPlaylists(res.data.playlists);
    } catch { toast.error('Failed to load playlists'); }
    finally { setLoading(false); }
  };

  const fetchAllSongs = async () => {
    const res = await songsAPI.getAll({ limit: 100 });
    setAllSongs(res.data.songs);
  };

  useEffect(() => { fetchPlaylists(); fetchAllSongs(); }, []);

  const openCreate = () => {
    setEditPlaylist(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (pl) => {
    setEditPlaylist(pl);
    setForm({ name: pl.name, description: pl.description, isPublic: pl.isPublic });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    setSubmitting(true);
    try {
      if (editPlaylist) {
        await playlistsAPI.update(editPlaylist._id, form);
        toast.success('Playlist updated!');
      } else {
        await playlistsAPI.create(form);
        toast.success('Playlist created! 🎶');
      }
      setShowModal(false);
      fetchPlaylists();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save playlist');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await playlistsAPI.delete(id);
      toast.success('Playlist deleted');
      setDeleteId(null);
      fetchPlaylists();
    } catch { toast.error('Failed to delete'); }
  };

  const openSongPicker = (pl) => {
    setTargetPlaylist(pl);
    const existingIds = pl.songs?.map((s) => String(s._id || s)) || [];
    setSelectedSongs(existingIds);
    setSongSearch('');
    setShowSongPicker(true);
  };

  const toggleSong = (id) => {
    setSelectedSongs((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const saveSongSelection = async () => {
    if (!targetPlaylist) return;
    try {
      // Remove songs not selected
      const currentIds = targetPlaylist.songs?.map((s) => String(s._id || s)) || [];
      const toRemove = currentIds.filter((id) => !selectedSongs.includes(id));
      const toAdd = selectedSongs.filter((id) => !currentIds.includes(id));

      for (const id of toRemove) {
        await playlistsAPI.removeSong(targetPlaylist._id, id);
      }
      if (toAdd.length > 0) {
        await playlistsAPI.addSongs(targetPlaylist._id, toAdd);
      }
      toast.success('Playlist songs updated!');
      setShowSongPicker(false);
      fetchPlaylists();
    } catch { toast.error('Failed to update songs'); }
  };

  const filteredSongs = allSongs.filter((s) =>
    s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
    s.artist.toLowerCase().includes(songSearch.toLowerCase())
  );

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-28 px-6 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Playlist Manager</h1>
          <p className="text-white/40 text-sm mt-1">{playlists.length} playlists</p>
        </div>
        <button onClick={openCreate} className="btn-primary px-5 py-2.5">
          <Plus size={18} /> New Playlist
        </button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((pl, i) => (
          <motion.div
            key={pl._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex gap-4">
              <img src={pl.coverUrl} alt={pl.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{pl.name}</p>
                <p className="text-white/40 text-sm mt-0.5">{pl.songs?.length || 0} songs</p>
                {pl.description && <p className="text-white/30 text-xs mt-1 line-clamp-2">{pl.description}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => openSongPicker(pl)} className="text-xs px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/40 text-primary-300 rounded-lg transition-all flex items-center gap-1">
                    <Music2 size={12} /> Songs
                  </button>
                  <button onClick={() => openEdit(pl)} className="p-1.5 text-white/40 hover:text-primary-400 hover:bg-primary-600/20 rounded-lg transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteId(pl._id)} className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card w-full max-w-md">
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
                <h2 className="text-xl font-bold text-white">{editPlaylist ? 'Edit Playlist' : 'New Playlist'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Name <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Playlist name" className="input-field" />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Optional description" rows={3} className="input-field resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setForm({...form, isPublic: !form.isPublic})} className={`w-12 h-6 rounded-full transition-colors ${form.isPublic ? 'bg-primary-600' : 'bg-white/10'} relative`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isPublic ? 'left-7' : 'left-1'}`} />
                  </button>
                  <label className="text-white/60 text-sm">Public Playlist</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                    {submitting ? <Loader size={18} className="animate-spin" /> : editPlaylist ? 'Save' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Song Picker Modal */}
      <AnimatePresence>
        {showSongPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Manage Songs — {targetPlaylist?.name}</h2>
                <button onClick={() => setShowSongPicker(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>
              <div className="px-6 py-3 border-b border-white/5">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={songSearch} onChange={(e) => setSongSearch(e.target.value)} placeholder="Search songs..." className="input-field pl-9 py-2 text-sm" />
                </div>
                <p className="text-white/30 text-xs mt-2">{selectedSongs.length} songs selected</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {filteredSongs.map((song) => {
                  const sel = selectedSongs.includes(String(song._id));
                  return (
                    <div key={song._id} onClick={() => toggleSong(String(song._id))} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${sel ? 'bg-primary-600/20 border border-primary-500/30' : 'hover:bg-white/5'}`}>
                      {sel ? <CheckSquare size={18} className="text-primary-400 flex-shrink-0" /> : <Square size={18} className="text-white/20 flex-shrink-0" />}
                      <img src={song.coverUrl} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{song.title}</p>
                        <p className="text-white/40 text-xs truncate">{song.artist}</p>
                      </div>
                      <span className="text-white/20 text-xs flex-shrink-0">{song.genre}</span>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 py-4 border-t border-white/10 flex gap-3">
                <button onClick={() => setShowSongPicker(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={saveSongSelection} className="btn-primary flex-1 justify-center">Save Songs</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card p-8 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Playlist?</h3>
              <p className="text-white/50 text-sm mb-6">This will permanently delete the playlist. Songs will not be deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1 justify-center">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
