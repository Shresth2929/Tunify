import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Music2, Loader, ArrowRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [isSent, setIsSent]     = useState(false);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      toast.success(res.data.message || 'Email sent!');
      setIsSent(true);
      // For demo purposes, we log the token or mock URL to console in backend.
      if (res.data.data) {
        console.log(`Demo Reset URL: http://localhost:5173/reset-password/${res.data.data}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex poster-grid" style={{ background: '#080808' }}>

      {/* ── LEFT — Poster art panel ───────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-end p-12">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(249,115,22,0.18) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 70%, rgba(236,72,153,0.1) 0%, transparent 60%)' }} />
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop"
            alt="Music"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,8,8,0) 0%, rgba(8,8,8,0.2) 80%, rgba(8,8,8,1) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.8) 0%, transparent 60%)' }} />
        </div>
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
          <h1 className="font-black leading-[0.9] tracking-tighter text-white mb-2" style={{ fontSize: '5rem' }}>LOST</h1>
          <h1 className="font-black leading-[0.9] tracking-tighter mb-6" style={{ fontSize: '5rem', background: 'linear-gradient(135deg,#FB923C,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            YOUR RHYTHM?
          </h1>
          <p className="text-white/40 text-base max-w-xs leading-relaxed">
            Don't worry, we'll help you get back into the groove. Reset your password to continue.
          </p>
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
        <div className="absolute top-10 right-10 flex flex-col items-end gap-3 text-white/15 font-black text-xl">
          <span>▲</span>
          <span className="text-sm">◯</span>
          <span className="text-xs">✕</span>
        </div>
        <div className="absolute top-10 left-10 text-xs font-bold text-white/20 uppercase tracking-[0.3em]">03*</div>
      </div>

      {/* ── RIGHT — Forgot Password form ──────────────────────── */}
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

          <h2 className="text-3xl font-black text-white mb-1">Reset Password</h2>
          <p className="text-white/30 text-sm mb-8">Enter your email to receive a reset link</p>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field pl-10"
                  />
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 mt-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 0 25px rgba(249,115,22,0.5)' }}
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <>Send Reset Link <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: 'rgba(249,115,22,0.15)' }}>
                <Mail size={20} style={{ color: '#F97316' }} />
              </div>
              <h3 className="text-white font-bold mb-2">Check your inbox</h3>
              <p className="text-white/40 text-sm">We've sent password reset instructions to {email}. (Check terminal console if running locally without SMTP).</p>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <p className="text-white/30 text-sm">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold transition-colors hover:text-primary-400" style={{ color: '#F97316' }}>
                Sign in
              </Link>
            </p>
          </div>

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
