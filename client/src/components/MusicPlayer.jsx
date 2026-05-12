import { useEffect, useRef, useState } from 'react';
import usePlayerStore from '../store/playerStore';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1,
} from 'lucide-react';
import { motion } from 'framer-motion';

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function MusicPlayer() {
  const {
    currentSong, isPlaying, isShuffle, repeatMode, volume, seek, duration,
    togglePlay, playNext, playPrev, setVolume, seekTo, toggleShuffle, toggleRepeat,
  } = usePlayerStore();

  const [showVol, setShowVol] = useState(false);
  const progress = duration > 0 ? (seek / duration) * 100 : 0;
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  if (!currentSong) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Orange progress bar — full width, sits at very top of player */}
      <div className="relative h-1 bg-white/5 cursor-pointer group">
        {/* Glow track */}
        <div
          className="h-full transition-all duration-200 group-hover:h-1.5 relative"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #EA580C, #F97316, #FB923C)',
            boxShadow: '0 0 12px rgba(249,115,22,0.7)',
          }}
        >
          {/* Thumb dot */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: '#FB923C', boxShadow: '0 0 8px rgba(249,115,22,0.9)' }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={seek}
          onChange={(e) => seekTo(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer z-10 -mt-1.5"
        />
      </div>

      {/* Player body */}
      <div
        className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 gap-2 sm:gap-4"
        style={{
          background: 'rgba(10,10,10,0.97)',
          backdropFilter: 'blur(30px)',
          borderTop: '1px solid rgba(249,115,22,0.12)',
        }}
      >
        {/* Song info */}
        <div className="flex items-center gap-2 sm:gap-3 w-[45%] sm:w-1/3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover"
              style={{ boxShadow: '0 0 16px rgba(249,115,22,0.3)' }}
            />
            {/* Playing indicator dot */}
            {isPlaying && (
              <div
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                style={{ background: '#F97316', boxShadow: '0 0 6px rgba(249,115,22,0.8)' }}
              />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-white font-semibold text-[13px] sm:text-sm truncate">{currentSong.title}</p>
            <p className="text-white/40 text-[11px] sm:text-xs truncate">{currentSong.artist}</p>
          </div>

          {/* Mini waveform when playing */}
          {isPlaying && (
            <div className="hidden sm:flex items-end gap-[2px] h-5 flex-shrink-0 ml-1">
              {[1,2,3,4,5].map(i => (
                <div
                  key={i}
                  className="waveform-bar w-[3px] rounded-full"
                  style={{ background: 'linear-gradient(to top, #F97316, #FB923C)' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-1">
          <button
            onClick={toggleShuffle}
            className={`hidden sm:block transition-all duration-200 ${isShuffle ? 'text-primary-400 scale-110' : 'text-white/30 hover:text-white/60'}`}
          >
            <Shuffle size={16} />
          </button>

          <button
            onClick={playPrev}
            className="text-white/60 hover:text-white transition-colors hover:scale-110 active:scale-95"
          >
            <SkipBack size={18} fill="currentColor" className="sm:w-5 sm:h-5" />
          </button>

          {/* Main play button */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              boxShadow: '0 0 25px rgba(249,115,22,0.6)',
            }}
          >
            {isPlaying
              ? <Pause size={18} fill="white" className="text-white sm:w-5 sm:h-5" />
              : <Play size={18} fill="white" className="text-white ml-0.5 sm:w-5 sm:h-5" />
            }
          </button>

          <button
            onClick={playNext}
            className="text-white/60 hover:text-white transition-colors hover:scale-110 active:scale-95"
          >
            <SkipForward size={18} fill="currentColor" className="sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`hidden sm:block transition-all duration-200 ${repeatMode !== 'none' ? 'text-primary-400 scale-110' : 'text-white/30 hover:text-white/60'}`}
          >
            <RepeatIcon size={16} />
          </button>
        </div>

        {/* Volume & time */}
        <div className="flex items-center justify-end gap-3 w-[25%] sm:w-1/3 min-w-0">
          <span className="text-white/30 text-[10px] sm:text-xs font-mono flex-shrink-0 tabular-nums">
            {formatTime(seek)} / {formatTime(duration)}
          </span>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              className="text-white/40 hover:text-white transition-colors flex-shrink-0"
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 cursor-pointer flex-shrink-0"
              style={{ accentColor: '#F97316' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
