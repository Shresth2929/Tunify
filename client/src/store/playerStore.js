import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Howl } from 'howler';
import { songsAPI } from '../services/api';

let howlInstance = null;

const usePlayerStore = create(
  persist(
    (set, get) => ({
      // State
      currentSong: null,
      queue: [],
      queueIndex: -1,
      isPlaying: false,
      isShuffle: false,
      repeatMode: 'none', // 'none' | 'one' | 'all'
      volume: 0.8,
      seek: 0,
      duration: 0,
      isLoading: false,
      recentlyPlayed: [], // tracks listening history for AI recommendations

      // Actions
      playSong: (song, queue = null) => {
        const { volume, recentlyPlayed } = get();

        // Stop existing
        if (howlInstance) {
          howlInstance.stop();
          howlInstance.unload();
        }

        const newQueue = queue || [song];
        const index = newQueue.findIndex((s) => s._id === song._id);

        // Update recently played — prepend, dedupe, cap at 30
        const filtered = recentlyPlayed.filter((s) => s._id !== song._id);
        const updatedRecent = [song, ...filtered].slice(0, 30);

        howlInstance = new Howl({
          src: [song.audioUrl],
          html5: true,
          volume,
          onplay: () => {
            set({ isPlaying: true, duration: howlInstance.duration() || 0 });
            // Increment play count
            songsAPI.incrementPlay(song._id).catch(() => {});
            // Tick seek
            const tick = setInterval(() => {
              if (!howlInstance) { clearInterval(tick); return; }
              set({ seek: howlInstance.seek() || 0, duration: howlInstance.duration() || 0 });
              if (!howlInstance.playing()) clearInterval(tick);
            }, 500);
          },
          onend: () => {
            const { repeatMode, queueIndex, queue: q, isShuffle } = get();
            if (repeatMode === 'one') {
              get().playSong(q[queueIndex], q);
            } else if (repeatMode === 'all' || queueIndex < q.length - 1) {
              const nextIdx = isShuffle
                ? Math.floor(Math.random() * q.length)
                : (queueIndex + 1) % q.length;
              get().playSong(q[nextIdx], q);
              set({ queueIndex: nextIdx });
            } else {
              set({ isPlaying: false, seek: 0 });
            }
          },
          onloaderror: () => set({ isLoading: false, isPlaying: false }),
          onload: () => set({ isLoading: false, duration: howlInstance.duration() || 0 }),
        });

        set({
          currentSong: song,
          queue: newQueue,
          queueIndex: index,
          seek: 0,
          isLoading: true,
          recentlyPlayed: updatedRecent,
        });

        howlInstance.play();
      },

      togglePlay: () => {
        if (!howlInstance) return;
        if (howlInstance.playing()) {
          howlInstance.pause();
          set({ isPlaying: false });
        } else {
          howlInstance.play();
          set({ isPlaying: true });
        }
      },

      playNext: () => {
        const { queue, queueIndex, isShuffle } = get();
        if (!queue.length) return;
        const nextIdx = isShuffle
          ? Math.floor(Math.random() * queue.length)
          : (queueIndex + 1) % queue.length;
        set({ queueIndex: nextIdx });
        get().playSong(queue[nextIdx], queue);
      },

      playPrev: () => {
        const { queue, queueIndex, seek } = get();
        if (!queue.length) return;
        if (seek > 3) {
          howlInstance?.seek(0);
          set({ seek: 0 });
          return;
        }
        const prevIdx = queueIndex <= 0 ? queue.length - 1 : queueIndex - 1;
        set({ queueIndex: prevIdx });
        get().playSong(queue[prevIdx], queue);
      },

      setVolume: (vol) => {
        set({ volume: vol });
        howlInstance?.volume(vol);
      },

      seekTo: (time) => {
        if (howlInstance) {
          howlInstance.seek(time);
          set({ seek: time });
        }
      },

      toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),

      toggleRepeat: () =>
        set((s) => ({
          repeatMode: s.repeatMode === 'none' ? 'all' : s.repeatMode === 'all' ? 'one' : 'none',
        })),
    }),
    {
      name: 'tunify_player',
      // Only persist non-howl state
      partialize: (s) => ({
        volume: s.volume,
        isShuffle: s.isShuffle,
        repeatMode: s.repeatMode,
        recentlyPlayed: s.recentlyPlayed,
      }),
    }
  )
);

export default usePlayerStore;
