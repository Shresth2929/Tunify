import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Music2, ListMusic, Users, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STAT_COLORS = [
  { from: '#F97316', to: '#EA580C', shadow: 'rgba(249,115,22,0.4)' },
  { from: '#EC4899', to: '#DB2777', shadow: 'rgba(236,72,153,0.35)' },
  { from: '#10B981', to: '#059669', shadow: 'rgba(16,185,129,0.3)' },
  { from: '#8B5CF6', to: '#7C3AED', shadow: 'rgba(139,92,246,0.3)' },
];

const StatCard = ({ icon: Icon, label, value, colorIdx, delay }) => {
  const c = STAT_COLORS[colorIdx] || STAT_COLORS[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${c.from}, ${c.to})` }} />

      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})`, boxShadow: `0 0 20px ${c.shadow}` }}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-white/40 text-sm font-medium">{label}</p>
      <p className="text-4xl font-black text-white mt-1 tracking-tight">{value}</p>
    </motion.div>
  );
};

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then((res) => setStats(res.data.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex-1 overflow-y-auto pb-28 px-6 pt-8" style={{ background: '#0D0D0D' }}>
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-white/5 rounded-xl w-1/3 mb-2" />
        <div className="h-4 bg-white/[0.03] rounded w-1/4" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[1,2,3,4].map(i => <div key={i} className="h-36 bg-white/[0.04] rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-28 px-6 pt-8" style={{ background: '#0D0D0D' }}>

      {/* Header */}
      <div className="mb-8">
        <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mb-1">⊕ CONTROL CENTER</p>
        <h1 className="text-3xl font-black text-white tracking-tighter">Admin Dashboard</h1>
        <p className="text-white/35 text-sm mt-1">Manage your music library and platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Music2} label="Total Songs" value={stats?.totalSongs ?? 0} colorIdx={0} delay={0} />
        <StatCard icon={ListMusic} label="Playlists" value={stats?.totalPlaylists ?? 0} colorIdx={1} delay={0.08} />
        <StatCard icon={Users} label="Users" value={stats?.totalUsers ?? 0} colorIdx={2} delay={0.16} />
        <StatCard icon={TrendingUp} label="Genres" value={stats?.genreBreakdown?.length ?? 0} colorIdx={3} delay={0.24} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl p-6" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-base font-black text-white mb-5 flex items-center gap-2 tracking-tight">
            <BarChart3 size={16} style={{ color: '#F97316' }} /> Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/admin/songs"
              className="flex items-center justify-between p-4 rounded-xl transition-all group hover:scale-[1.01]"
              style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 0 12px rgba(249,115,22,0.4)' }}>
                  <Music2 size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Manage Songs</p>
                  <p className="text-white/35 text-xs">Upload, edit &amp; delete songs</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white/30 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link to="/admin/playlists"
              className="flex items-center justify-between p-4 rounded-xl transition-all group hover:scale-[1.01]"
              style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#EC4899,#DB2777)', boxShadow: '0 0 12px rgba(236,72,153,0.35)' }}>
                  <ListMusic size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Manage Playlists</p>
                  <p className="text-white/35 text-xs">Create, edit &amp; organize playlists</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white/30 group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </motion.div>

        {/* Top Songs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          className="rounded-2xl p-6" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-base font-black text-white mb-5 flex items-center gap-2 tracking-tight">
            <TrendingUp size={16} style={{ color: '#F97316' }} /> Top Played Songs
          </h2>
          <div className="space-y-3">
            {stats?.topSongs?.length === 0 && (
              <p className="text-white/25 text-sm text-center py-6">No play data yet</p>
            )}
            {stats?.topSongs?.map((song, i) => (
              <div key={song._id} className="flex items-center gap-3 group">
                <span className="text-white/20 text-xs w-4 text-center tabular-nums">{i + 1}</span>
                <img src={song.coverUrl} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{song.title}</p>
                  <p className="text-white/35 text-xs truncate">{song.artist}</p>
                </div>
                <span className="text-xs font-bold flex-shrink-0" style={{ color: '#F97316' }}>{song.plays}×</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Genre Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-6 lg:col-span-2" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-base font-black text-white mb-5 flex items-center gap-2 tracking-tight">
            <BarChart3 size={16} style={{ color: '#F97316' }} /> Songs by Genre
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats?.genreBreakdown?.map((g, idx) => (
              <div key={g._id} className="rounded-xl p-4 relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-white/40 text-xs mb-1 font-medium">{g._id || 'Other'}</p>
                <p className="text-2xl font-black text-white">{g.count}</p>
                <div className="mt-3 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(g.count / (stats?.totalSongs || 1)) * 100}%`,
                      background: idx % 2 === 0
                        ? 'linear-gradient(90deg,#F97316,#EA580C)'
                        : 'linear-gradient(90deg,#EC4899,#DB2777)',
                      boxShadow: idx % 2 === 0 ? '0 0 8px rgba(249,115,22,0.5)' : '0 0 8px rgba(236,72,153,0.4)',
                    }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
