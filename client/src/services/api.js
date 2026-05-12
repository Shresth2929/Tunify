import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tunify_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tunify_token');
      localStorage.removeItem('tunify_auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  me:             ()     => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgotpassword', data),
  resetPassword:  (token, data) => api.put(`/auth/resetpassword/${token}`, data),
};

export const songsAPI = {
  getAll:        (params) => api.get('/songs', { params }),
  getById:       (id)     => api.get(`/songs/${id}`),
  getGenres:     ()       => api.get('/songs/genres'),
  incrementPlay: (id)     => api.post(`/songs/${id}/play`),
  likeSong:      (id)     => api.post(`/songs/${id}/like`),
  create:        (formData) => api.post('/songs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:        (id, formData) => api.put(`/songs/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:        (id)     => api.delete(`/songs/${id}`),
};

export const playlistsAPI = {
  getAll:         ()              => api.get('/playlists'),
  getMyPlaylists: ()              => api.get('/playlists/my'),
  getById:        (id)            => api.get(`/playlists/${id}`),
  create:         (data)          => api.post('/playlists', data),
  update:         (id, data)      => api.put(`/playlists/${id}`, data),
  delete:         (id)            => api.delete(`/playlists/${id}`),
  addSongs:       (id, songIds)   => api.post(`/playlists/${id}/songs`, { songIds }),
  removeSong:     (id, songId)    => api.delete(`/playlists/${id}/songs/${songId}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
};

export const aiAPI = {
  generatePlaylist:  (data)  => api.post('/ai/generate-playlist', data),
  getMoodSongs:      (mood)  => api.post('/ai/mood-songs', { mood }),
  getRecommendations:(data)  => api.post('/ai/recommendations', data),
};

export default api;
