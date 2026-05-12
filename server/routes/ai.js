const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: get model
const getModel = () => genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ── Util: build song catalogue summary for Gemini ──────────────────────
const buildCatalogue = (songs) =>
  songs.map((s, i) => `${i}. ID:${s._id} | "${s.title}" by ${s.artist} | Genre:${s.genre} | Plays:${s.plays}`).join('\n');

// ──────────────────────────────────────────────────────────────────────
// @POST /api/ai/generate-playlist
// Body: { mood, prompt, name }
// Auth: required
// ──────────────────────────────────────────────────────────────────────
router.post('/generate-playlist', protect, async (req, res) => {
  const { mood, prompt, name } = req.body;
  if (!mood && !prompt) {
    return res.status(400).json({ success: false, message: 'Provide a mood or prompt' });
  }

  // Fetch all songs
  const songs = await Song.find({}).select('_id title artist genre plays coverUrl audioUrl');
  if (!songs.length) {
    return res.status(400).json({ success: false, message: 'No songs in the library yet' });
  }

  const catalogue = buildCatalogue(songs);
  const userPrompt = prompt || `mood: ${mood}`;

  const aiPrompt = `
You are a music curator AI for a streaming platform called Tunify.
A user wants a playlist for: "${userPrompt}"

Here is the full song catalogue (numbered list):
${catalogue}

Instructions:
- Pick 8 to 12 songs that best fit the user's request.
- ONLY return a valid JSON array of MongoDB ObjectId strings (the ID after "ID:" in the catalogue).
- Do NOT include any explanation, markdown, or code fences — ONLY the raw JSON array.
- Example output: ["6632a1b2c3d4e5f6a7b8c9d0","6632a1b2c3d4e5f6a7b8c9d1"]
`;

  let songIds = [];
  try {
    const model = getModel();
    const result = await model.generateContent(aiPrompt);
    const text = result.response.text().trim();
    // Strip markdown fences if Gemini wraps it anyway
    const cleaned = text.replace(/```json|```/g, '').trim();
    songIds = JSON.parse(cleaned);
    if (!Array.isArray(songIds)) throw new Error('Not an array');
  } catch (err) {
    console.error('Gemini parse error:', err.message);
    // Fallback: pick random 10 songs
    songIds = songs.sort(() => Math.random() - 0.5).slice(0, 10).map(s => String(s._id));
  }

  // Validate IDs against actual DB songs
  const validIds = songIds.filter(id => songs.some(s => String(s._id) === String(id)));
  const finalIds = validIds.length >= 3 ? validIds : songs.slice(0, 10).map(s => String(s._id));

  // Create playlist
  const playlistName = name || `${mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'AI'} Mix · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  const playlist = await Playlist.create({
    name: playlistName,
    description: `AI-generated playlist for: "${userPrompt}" — created by Tunify AI`,
    isPublic: false,
    coverUrl: `https://picsum.photos/seed/${Date.now()}/500/500`,
    songs: finalIds,
    createdBy: req.user._id,
  });

  await User.findByIdAndUpdate(req.user._id, { $push: { playlists: playlist._id } });

  // Populate for response
  const populated = await Playlist.findById(playlist._id)
    .populate('songs', 'title artist coverUrl duration audioUrl genre');

  res.status(201).json({
    success: true,
    playlist: populated,
    message: `AI created "${playlistName}" with ${finalIds.length} songs`,
  });
});

// ──────────────────────────────────────────────────────────────────────
// @POST /api/ai/mood-songs
// Body: { mood }
// Public
// ──────────────────────────────────────────────────────────────────────
router.post('/mood-songs', async (req, res) => {
  const { mood } = req.body;
  if (!mood) return res.status(400).json({ success: false, message: 'Mood is required' });

  const songs = await Song.find({}).select('_id title artist genre plays coverUrl audioUrl duration');
  if (!songs.length) return res.json({ success: true, songs: [] });

  const catalogue = buildCatalogue(songs);

  const aiPrompt = `
You are a music curator AI.
A user is feeling: "${mood}"

Song catalogue:
${catalogue}

Return ONLY a JSON array of up to 15 song IDs (the ID after "ID:") that best match this mood.
No explanation, no markdown — raw JSON array only.
Example: ["abc123","def456"]
`;

  let songIds = [];
  try {
    const model = getModel();
    const result = await model.generateContent(aiPrompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '').trim();
    songIds = JSON.parse(cleaned);
    if (!Array.isArray(songIds)) throw new Error('Not an array');
  } catch {
    // Fallback: genre-based mapping
    const moodGenreMap = {
      happy: ['Pop', 'HipHop', 'R&B'],
      chill: ['Lo-Fi', 'Jazz', 'R&B'],
      energetic: ['Techno', 'Rock', 'HipHop'],
      sad: ['Jazz', 'Lo-Fi', 'R&B'],
      focus: ['Lo-Fi', 'Jazz', 'Electronic'],
      party: ['Techno', 'HipHop', 'Pop'],
      romance: ['R&B', 'Jazz', 'Pop'],
      workout: ['Techno', 'Rock', 'HipHop'],
    };
    const genres = moodGenreMap[mood.toLowerCase()] || [];
    const matched = genres.length
      ? songs.filter(s => genres.some(g => s.genre?.toLowerCase().includes(g.toLowerCase())))
      : songs;
    songIds = matched.slice(0, 15).map(s => String(s._id));
  }

  const validSongs = songIds
    .map(id => songs.find(s => String(s._id) === String(id)))
    .filter(Boolean);

  const finalSongs = validSongs.length >= 3 ? validSongs : songs.slice(0, 15);

  res.json({ success: true, songs: finalSongs, mood });
});

// ──────────────────────────────────────────────────────────────────────
// @GET /api/ai/recommendations
// Auth: required — uses listening history from query param
// ──────────────────────────────────────────────────────────────────────
router.post('/recommendations', protect, async (req, res) => {
  const { recentSongIds = [], preferredGenres = [] } = req.body;

  const songs = await Song.find({}).select('_id title artist genre plays coverUrl audioUrl duration');
  if (!songs.length) return res.json({ success: true, songs: [] });

  // Fetch user's liked songs to extract genres for better personalization
  const userDoc = await User.findById(req.user._id).populate('likedSongs', 'genre');
  const likedGenres = (userDoc?.likedSongs || []).map(s => s.genre).filter(Boolean);
  const allPreferredGenres = [...new Set([...preferredGenres, ...likedGenres])];

  // If no history at all, return top played
  if (!recentSongIds.length && !allPreferredGenres.length) {
    const topSongs = [...songs].sort((a, b) => b.plays - a.plays).slice(0, 12);
    return res.json({ success: true, songs: topSongs, source: 'top-played' });
  }

  const catalogue = buildCatalogue(songs);
  const recentTitles = recentSongIds
    .map(id => songs.find(s => String(s._id) === id))
    .filter(Boolean)
    .map(s => `"${s.title}" by ${s.artist}`)
    .join(', ');

  const aiPrompt = `
You are a personalized music recommendation AI for Tunify.

User's recently played songs: ${recentTitles || 'unknown'}
User's preferred genres: ${allPreferredGenres.join(', ') || 'mixed'}

Full song catalogue:
${catalogue}

Based on the user's listening history and preferences, recommend 12 songs they will love.
- Prefer songs they haven't recently played
- Mix familiar genres with slight variety
- Return ONLY a JSON array of song IDs. No markdown, no explanation.
`;

  let songIds = [];
  try {
    const model = getModel();
    const result = await model.generateContent(aiPrompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '').trim();
    songIds = JSON.parse(cleaned);
    if (!Array.isArray(songIds)) throw new Error('Not an array');
  } catch {
    // Fallback: genre-preference based
    const genreFiltered = allPreferredGenres.length
      ? songs.filter(s => allPreferredGenres.some(g => s.genre?.toLowerCase().includes(g.toLowerCase())))
      : songs;
    const notRecent = genreFiltered.filter(s => !recentSongIds.includes(String(s._id)));
    songIds = (notRecent.length >= 5 ? notRecent : genreFiltered)
      .sort(() => Math.random() - 0.5)
      .slice(0, 12)
      .map(s => String(s._id));
  }

  const recommended = songIds
    .map(id => songs.find(s => String(s._id) === String(id)))
    .filter(Boolean);

  res.json({ success: true, songs: recommended, source: 'ai' });
});

module.exports = router;
