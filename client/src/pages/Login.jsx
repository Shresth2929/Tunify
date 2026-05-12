import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Music2, Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login } = useAuthStore();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎵');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex poster-grid" style={{ background: '#080808' }}>

      {/* ── LEFT — Poster art panel ───────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-end p-12">

        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(249,115,22,0.18) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 70%, rgba(236,72,153,0.1) 0%, transparent 60%)' }} />

        {/* Artist image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop"
            alt="Music"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,8,8,0) 0%, rgba(8,8,8,0.2) 80%, rgba(8,8,8,1) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.8) 0%, transparent 60%)' }} />
        </div>

        {/* Poster text */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 0 20px rgba(249,115,22,0.5)' }}>
              <Music2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-black" style={{ background: 'linear-gradient(135deg,#FB923C,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Tunify
            </span>
          </div>

          <h1 className="font-black leading-[0.9] tracking-tighter text-white mb-2" style={{ fontSize: '5rem' }}>FACE</h1>
          <h1 className="font-black leading-[0.9] tracking-tighter mb-6" style={{ fontSize: '5rem', background: 'linear-gradient(135deg,#FB923C,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            THE MUSIC
          </h1>
          <p className="text-white/40 text-base max-w-xs leading-relaxed">
            Sign in and step into a world where every beat tells a story.
          </p>

          {/* Waveform decoration */}
          <div className="flex items-end gap-[3px] h-10 mt-8">
            {[50, 80, 45, 100, 60, 35, 90, 55, 75, 40].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.3}%`] }}
                transition={{ duration: 0.8 + i * 0.08, repeat: Infinity, ease: 'easeInOut' }}
                className="w-[4px] rounded-full"
                style={{ background: i % 2 === 0 ? '#F97316' : 'rgba(236,72,153,0.8)' }}
              />
            ))}
          </div>
        </div>

        {/* Abstract symbols */}
        <div className="absolute top-10 right-10 flex flex-col items-end gap-3 text-white/15 font-black text-xl">
          <span>▲</span>
          <span className="text-sm">◯</span>
          <span className="text-xs">✕</span>
        </div>
        <div className="absolute top-10 left-10 text-xs font-bold text-white/20 uppercase tracking-[0.3em]">02*</div>
      </div>

      {/* ── RIGHT — Login form ────────────────────────────────── */}
      <div className="w-full lg:w-[420px] flex-shrink-0 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo (mobile only) */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)' }}>
              <Music2 size={17} className="text-white" />
            </div>
            <span className="text-xl font-black" style={{ background: 'linear-gradient(135deg,#FB923C,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tunify</span>
          </div>

          <h2 className="text-3xl font-black text-white mb-1">Welcome back</h2>
          <p className="text-white/30 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold transition-colors hover:text-primary-400" style={{ color: '#F97316' }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 mt-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 0 25px rgba(249,115,22,0.5)' }}
            >
              {loading ? <Loader size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/30 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold transition-colors hover:text-primary-400" style={{ color: '#F97316' }}>
                Sign up
              </Link>
            </p>
          </div>

          {/* Bottom decorative line */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(249,115,22,0.15)' }} />
            <span className="text-white/20 text-xs font-bold">TUNIFY</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(249,115,22,0.15)' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
