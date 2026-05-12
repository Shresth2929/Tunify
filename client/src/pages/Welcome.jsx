import { motion } from 'framer-motion';
import { Music2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Floating music notes background
const NOTES = [
  { char: '♪', left: '8%',  delay: 0,   dur: 8  },
  { char: '♫', left: '20%', delay: 2.5, dur: 10 },
  { char: '♩', left: '35%', delay: 1,   dur: 7  },
  { char: '♬', left: '55%', delay: 4,   dur: 9  },
  { char: '♪', left: '70%', delay: 1.5, dur: 6  },
  { char: '♫', left: '82%', delay: 3,   dur: 11 },
  { char: '♩', left: '92%', delay: 0.5, dur: 8  },
];

// 5 sequential arrows that light up one-by-one
function SequentialArrows() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="text-sm font-black"
          animate={{
            color: ['rgba(255,255,255,0.15)', '#F97316', 'rgba(255,255,255,0.15)'],
            textShadow: ['none', '0 0 10px rgba(249,115,22,0.9)', 'none'],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        >
          ▶
        </motion.span>
      ))}
    </div>
  );
}

export default function Welcome() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen text-white overflow-hidden relative flex flex-col poster-grid"
      style={{ background: '#080808' }}
    >
      {/* Click overlay */}
      <Link to="/login" className="absolute inset-0 z-40" aria-label="Enter App" />

      {/* ── Floating music notes ─────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {NOTES.map((n, i) => (
          <span
            key={i}
            className="music-note select-none"
            style={{
              left: n.left,
              bottom: '-2rem',
              animationDuration: `${n.dur}s`,
              animationDelay: `${n.delay}s`,
              fontSize: i % 2 === 0 ? '1.2rem' : '1.8rem',
            }}
          >
            {n.char}
          </span>
        ))}
      </div>

      {/* ── Ambient glow blobs ───────────────────────────────── */}
      <div className="absolute pointer-events-none" style={{ top: '-200px', left: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', filter: 'blur(60px)', borderRadius: '50%' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-100px', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', filter: 'blur(80px)', borderRadius: '50%' }} />

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav className="relative z-30 flex items-center justify-between px-8 py-7 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 0 20px rgba(249,115,22,0.5)' }}>
            <Music2 size={18} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg,#FB923C,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tunify</span>
        </div>

        {/* Sequential arrows + label */}
        <div className="hidden md:flex items-center gap-4 text-white/20 text-xs font-bold uppercase tracking-widest">
          <SequentialArrows />
          <span className="text-white/20">Music Online</span>
          <span style={{ color: 'rgba(249,115,22,0.4)' }}>|</span>
          <span className="text-white/20">Feel the Sound</span>
        </div>
      </nav>

      {/* ── Main poster layout ───────────────────────────────── */}
      <main className="relative z-30 flex-1 max-w-7xl mx-auto px-8 w-full flex flex-col lg:flex-row items-center gap-8 pb-16">

        {/* LEFT — Hero Typography */}
        <div className="flex-1 relative">

          {/* Sequential arrows row (replaces old ✕ + arrows) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 flex items-center gap-4"
          >
            <SequentialArrows />
          </motion.div>

          {/* Giant headline */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-black leading-[0.9] tracking-tighter mb-2" style={{ fontSize: 'clamp(4rem, 10vw, 8rem)' }}>
              <span className="text-white">MUSIC</span>
            </h1>
            <h1 className="font-black leading-[0.9] tracking-tighter mb-8" style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ONLINE
            </h1>
          </motion.div>

          {/* Tagline row */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="flex items-center gap-5 mb-10"
          >
            {/* Waveform decoration */}
            <div className="flex items-end gap-[3px] h-10">
              {[40, 70, 55, 90, 65, 45, 80].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.3}%`] }}
                  transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[4px] rounded-full"
                  style={{ background: i % 2 === 0 ? '#F97316' : '#EC4899' }}
                />
              ))}
            </div>
            <p className="text-white/50 text-lg font-medium">Move the beat.</p>
          </motion.div>

          {/* Sub text + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="space-y-6"
          >
            <p className="text-white/35 text-base max-w-sm leading-relaxed">
              Your music, your world. Immerse yourself in studio-grade soundscapes tailored for the moments that matter.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 0 25px rgba(249,115,22,0.5)' }}>
                <span>get music</span>
                <ArrowRight size={16} />
              </div>
              <div className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white/60 transition-all hover:text-white" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                More tracks
              </div>
            </div>
          </motion.div>

          {/* Click hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="mt-14 text-xs uppercase tracking-[0.4em] text-white/30 font-semibold"
          >
            Click anywhere to enter →
          </motion.p>
        </div>

        {/* RIGHT — Artist image panel */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block flex-shrink-0"
          style={{ width: '420px' }}
        >
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at 60% 50%, rgba(249,115,22,0.25) 0%, rgba(236,72,153,0.1) 60%, transparent 100%)', filter: 'blur(40px)', transform: 'scale(1.1)' }} />

          <div className="relative overflow-hidden" style={{ borderRadius: '28px', border: '1px solid rgba(249,115,22,0.2)' }}>
            <img
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop"
              alt="Artist"
              className="w-full object-cover"
              style={{ height: '520px', objectPosition: 'top' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,8,8,0) 30%, rgba(249,115,22,0.15) 70%, rgba(8,8,8,0.9) 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-1">Featured Artist</p>
              <h2 className="text-white font-black text-2xl">FEEL THE</h2>
              <h2 className="font-black text-2xl" style={{ color: '#F97316' }}>SOUND</h2>
            </div>
            <div className="absolute top-5 right-5 flex flex-col items-end gap-2">
              <span className="text-white/30 text-lg font-black">▲</span>
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: 'rgba(249,115,22,0.5)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: '#F97316' }} />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-6 text-5xl font-black" style={{ color: 'rgba(249,115,22,0.15)' }}>✕</div>
        </motion.div>
      </main>

      {/* ── Bottom abstract bar ─────────────────────────────────── */}
      <div className="relative z-30 w-full flex items-center justify-between px-8 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          {['▲', '◯', '▶▶▶', '◈'].map((s, i) => (
            <span key={i} className="text-white/10 text-xs font-bold">{s}</span>
          ))}
        </div>
        <div className="flex items-end gap-[3px] h-6">
          {[50, 80, 60, 100, 70, 40, 90, 55].map((h, i) => (
            <div key={i} className="w-[3px] rounded-full" style={{ height: `${h}%`, background: i % 2 === 0 ? 'rgba(249,115,22,0.4)' : 'rgba(236,72,153,0.3)' }} />
          ))}
        </div>
        <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Tunify © 2026</p>
      </div>
    </motion.div>
  );
}
