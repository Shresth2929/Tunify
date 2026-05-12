import { useEffect, useState, useRef } from 'react';
import { songsAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit2, Trash2, X, Upload, Music2, Image, Loader,
  ChevronLeft, ChevronRight, CheckCircle
} from 'lucide-react';

const GENRES = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Electronic', 'Classical', 'R&B', 'Country', 'Latin', 'Other'];

const emptyForm = { title: '', artist: '', album: '', genre: 'Pop', year: new Date().getFullYear(), duration: '' };

export default function SongManager() {
  const [songs, setSongs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSong, setEditSong] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const audioRef = useRef();
  const coverRef = useRef();

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await songsAPI.getAll({ page, limit: 10, search: search || undefined, genre: filterGenre || undefined });
      setSongs(res.data.songs);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load songs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSongs(); }, [page, search, filterGenre]);

  const openCreate = () => {
    setEditSong(null);
    setForm(emptyForm);
    setAudioFile(null); setCoverFile(null);
    setAudioPreview(''); setCoverPreview('');
    setShowModal(true);
  };

  const openEdit = (song) => {
    setEditSong(song);
    setForm({ title: song.title, artist: song.artist, album: song.album || '', genre: song.genre, year: song.year, duration: song.duration || '' });
    setAudioFile(null); setCoverFile(null);
    setAudioPreview(song.audioUrl); setCoverPreview(song.coverUrl);
    setShowModal(true);
  };

  const handleAudio = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setAudioFile(f);
    setAudioPreview(URL.createObjectURL(f));
  };

  const handleCover = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.artist) return toast.error('Title and artist are required');
    if (!editSong && !audioFile && !form.audioUrl) return toast.error('Audio file is required');

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (audioFile) fd.append('audio', audioFile);
      if (coverFile) fd.append('cover', coverFile);

      if (editSong) {
        await songsAPI.update(editSong._id, fd);
        toast.success('Song updated! ✅');
      } else {
        await songsAPI.create(fd);
        toast.success('Song uploaded! 🎵');
      }
      setShowModal(false);
      fetchSongs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save song');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await songsAPI.delete(id);
      toast.success('Song deleted');
      setDeleteId(null);
      fetchSongs();
    } catch {
      toast.error('Failed to delete song');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-28 px-6 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Song Manager</h1>
          <p className="text-white/40 text-sm mt-1">{total} songs in library</p>
        </div>
        <button onClick={openCreate} className="btn-primary px-5 py-2.5">
          <Plus size={18} /> Upload Song
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search songs..."
            className="input-field pl-9 py-2"
          />
        </div>
        <select
          value={filterGenre}
          onChange={(e) => { setFilterGenre(e.target.value); setPage(1); }}
          className="select-field w-auto"
        >
          <option value="">All Genres</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Music2 size={48} className="mx-auto mb-3 opacity-30" />
            <p>No songs found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3">#</th>
                <th className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3">Song</th>
                <th className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3 hidden md:table-cell">Artist</th>
                <th className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Genre</th>
                <th className="text-left text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Plays</th>
                <th className="text-right text-white/40 text-xs font-semibold uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {songs.map((song, i) => (
                <motion.tr
                  key={song._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-white/30 text-sm">{(page - 1) * 10 + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{song.title}</p>
                        <p className="text-white/40 text-xs truncate">{song.album}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70 text-sm hidden md:table-cell">{song.artist}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="bg-primary-600/20 text-primary-300 text-xs px-2 py-1 rounded-full">{song.genre}</span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm hidden lg:table-cell">{song.plays}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(song)} className="p-2 text-white/40 hover:text-primary-400 hover:bg-primary-600/20 rounded-lg transition-all">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteId(song._id)} className="p-2 text-white/40 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary p-2 disabled:opacity-30">
            <ChevronLeft size={16} />
          </button>
          <span className="text-white/50 text-sm">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="btn-secondary p-2 disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Upload/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 glass-card rounded-b-none px-6 py-4 flex items-center justify-between border-b border-white/10 z-10">
                <h2 className="text-xl font-bold text-white">{editSong ? 'Edit Song' : 'Upload New Song'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cover Upload */}
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Cover Image</label>
                    <div
                      onClick={() => coverRef.current.click()}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-white/20 hover:border-primary-500/50 transition-colors group"
                    >
                      {coverPreview ? (
                        <img src={coverPreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 group-hover:text-white/60 transition-colors">
                          <Image size={32} />
                          <p className="text-xs mt-2">Click to upload</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload size={24} className="text-white" />
                      </div>
                    </div>
                    <input ref={coverRef} type="file" accept="image/*" onChange={handleCover} className="hidden" />
                  </div>

                  {/* Audio Upload */}
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Audio File {!editSong && <span className="text-red-400">*</span>}</label>
                    <div
                      onClick={() => audioRef.current.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-primary-500/50 transition-colors cursor-pointer group flex flex-col items-center justify-center"
                    >
                      {audioFile ? (
                        <div className="text-center p-4">
                          <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                          <p className="text-white/70 text-xs break-all">{audioFile.name}</p>
                          <p className="text-white/30 text-xs mt-1">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      ) : editSong && audioPreview ? (
                        <div className="text-center p-4">
                          <Music2 size={32} className="text-primary-400 mx-auto mb-2" />
                          <p className="text-white/50 text-xs">Current audio file</p>
                          <p className="text-white/30 text-xs mt-1">Click to replace</p>
                        </div>
                      ) : (
                        <div className="text-center text-white/30 group-hover:text-white/60 transition-colors p-4">
                          <Music2 size={32} className="mx-auto mb-2" />
                          <p className="text-xs">Click to upload MP3</p>
                          <p className="text-xs mt-1">Max 50MB</p>
                        </div>
                      )}
                    </div>
                    <input ref={audioRef} type="file" accept="audio/*" onChange={handleAudio} className="hidden" />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5">Title <span className="text-red-400">*</span></label>
                    <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Song title" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5">Artist <span className="text-red-400">*</span></label>
                    <input value={form.artist} onChange={(e) => setForm({...form, artist: e.target.value})} placeholder="Artist name" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5">Album</label>
                    <input value={form.album} onChange={(e) => setForm({...form, album: e.target.value})} placeholder="Album name" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5">Genre</label>
                    <select value={form.genre} onChange={(e) => setForm({...form, genre: e.target.value})} className="select-field">
                      {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5">Year</label>
                    <input type="number" value={form.year} onChange={(e) => setForm({...form, year: e.target.value})} placeholder="2024" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5">Duration (seconds)</label>
                    <input type="number" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} placeholder="240" className="input-field" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                    {submitting ? <Loader size={18} className="animate-spin" /> : editSong ? 'Save Changes' : 'Upload Song'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Song?</h3>
              <p className="text-white/50 text-sm mb-6">This will permanently delete the song and remove it from Cloudinary. This action cannot be undone.</p>
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
