import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, songsAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      likedSongIds: [], // fast lookup set of liked song _id strings

      login: async (email, password) => {
        const { data } = await authAPI.login({ email, password });
        localStorage.setItem('tunify_token', data.token);
        const likedSongIds = (data.user?.likedSongs || []).map(s =>
          typeof s === 'string' ? s : s._id
        );
        set({ user: data.user, token: data.token, isAuthenticated: true, likedSongIds });
        return data;
      },

      register: async (username, email, password) => {
        const { data } = await authAPI.register({ username, email, password });
        localStorage.setItem('tunify_token', data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true, likedSongIds: [] });
        return data;
      },

      logout: () => {
        localStorage.removeItem('tunify_token');
        set({ user: null, token: null, isAuthenticated: false, likedSongIds: [] });
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // Toggle like and sync likedSongIds
      toggleLike: async (songId) => {
        const { likedSongIds } = get();
        const alreadyLiked = likedSongIds.includes(songId);
        // Optimistic update
        set({
          likedSongIds: alreadyLiked
            ? likedSongIds.filter(id => id !== songId)
            : [...likedSongIds, songId],
        });
        try {
          await songsAPI.likeSong(songId);
        } catch {
          // Revert on error
          set({ likedSongIds: get().likedSongIds });
        }
      },

      // Refresh liked song IDs from server (call after login if needed)
      refreshMe: async () => {
        try {
          const { data } = await authAPI.me();
          const likedSongIds = (data.user?.likedSongs || []).map(s =>
            typeof s === 'string' ? s : s._id
          );
          set({ user: data.user, likedSongIds });
        } catch { /* ignore */ }
      },
    }),
    {
      name: 'tunify_auth',
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
        likedSongIds: s.likedSongIds,
      }),
    }
  )
);

export default useAuthStore;
