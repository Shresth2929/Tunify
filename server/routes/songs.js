const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadAudio, uploadImage } = require('../middleware/upload');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');

// @GET /api/songs — list all songs with optional search/filter
router.get('/', async (req, res) => {
  const { search, genre, artist, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const query = { isActive: true };

  if (search) query.$text = { $search: search };
  if (genre) query.genre = genre;
  if (artist) query.artist = new RegExp(artist, 'i');

  const songs = await Song.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Song.countDocuments(query);
  res.json({ success: true, songs, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @GET /api/songs/genres — get distinct genres
router.get('/genres', async (req, res) => {
  const genres = await Song.distinct('genre', { isActive: true });
  res.json({ success: true, genres });
});

// @GET /api/songs/:id
router.get('/:id', async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
  res.json({ success: true, song });
});

// @POST /api/songs/:id/play — increment play count
router.post('/:id/play', async (req, res) => {
  await Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } });
  res.json({ success: true });
});

// @POST /api/songs/:id/like — toggle like (auth required)
router.post('/:id/like', protect, async (req, res) => {
  const User = require('../models/User');
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).json({ success: false, message: 'Song not found' });

  const user = await User.findById(req.user._id);
  const alreadyLiked = user.likedSongs.map(String).includes(String(song._id));

  if (alreadyLiked) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { likedSongs: song._id } });
    await Song.findByIdAndUpdate(song._id, { $inc: { likes: -1 } });
    return res.json({ success: true, liked: false, message: 'Song unliked' });
  } else {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { likedSongs: song._id } });
    await Song.findByIdAndUpdate(song._id, { $inc: { likes: 1 } });
    return res.json({ success: true, liked: true, message: 'Song liked' });
  }
});


// @POST /api/songs — upload song (admin only)
// Uses multer for both audio and cover in single request via fields
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', protect, adminOnly, async (req, res) => {
  // Accept multipart form with fields: audio, cover
  // We process uploads manually to Cloudinary
  const { uploadAudio: audioUpload, uploadImage: imageUpload } = require('../middleware/upload');

  // Use multer-storage-cloudinary already configured
  const uploadFields = require('multer')({
    storage: require('multer').memoryStorage(),
  }).fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]);

  uploadFields(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    const { title, artist, album, genre, year, duration } = req.body;
    if (!title || !artist) return res.status(400).json({ success: false, message: 'Title and artist required' });

    let audioUrl = req.body.audioUrl || '';
    let audioPublicId = '';
    let coverUrl = req.body.coverUrl || 'https://picsum.photos/seed/music/500/500';
    let coverPublicId = '';

    try {
      // Upload audio to Cloudinary
      if (req.files?.audio) {
        const audioResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'tunify/audio', resource_type: 'video' },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(req.files.audio[0].buffer);
        });
        audioUrl = audioResult.secure_url;
        audioPublicId = audioResult.public_id;
      }

      // Upload cover to Cloudinary
      if (req.files?.cover) {
        const coverResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'tunify/covers', resource_type: 'image', transformation: [{ width: 500, height: 500, crop: 'fill' }] },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(req.files.cover[0].buffer);
        });
        coverUrl = coverResult.secure_url;
        coverPublicId = coverResult.public_id;
      }

      if (!audioUrl) return res.status(400).json({ success: false, message: 'Audio file or URL required' });

      const song = await Song.create({
        title, artist, album, genre, year: year || new Date().getFullYear(),
        duration: duration || 0, audioUrl, audioPublicId, coverUrl, coverPublicId,
      });

      res.status(201).json({ success: true, song });
    } catch (uploadErr) {
      console.error(uploadErr);
      res.status(500).json({ success: false, message: 'Upload failed', error: uploadErr.message });
    }
  });
});

// @PUT /api/songs/:id — edit song metadata + optional new cover
router.put('/:id', protect, adminOnly, async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).json({ success: false, message: 'Song not found' });

  const uploadFields = require('multer')({
    storage: require('multer').memoryStorage(),
  }).fields([{ name: 'cover', maxCount: 1 }]);

  uploadFields(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    const { title, artist, album, genre, year, duration } = req.body;
    if (title) song.title = title;
    if (artist) song.artist = artist;
    if (album) song.album = album;
    if (genre) song.genre = genre;
    if (year) song.year = year;
    if (duration) song.duration = duration;

    if (req.files?.cover) {
      // Delete old cover
      if (song.coverPublicId) await cloudinary.uploader.destroy(song.coverPublicId);
      const coverResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'tunify/covers', resource_type: 'image', transformation: [{ width: 500, height: 500, crop: 'fill' }] },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.files.cover[0].buffer);
      });
      song.coverUrl = coverResult.secure_url;
      song.coverPublicId = coverResult.public_id;
    }

    await song.save();
    res.json({ success: true, song });
  });
});

// @DELETE /api/songs/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).json({ success: false, message: 'Song not found' });

  // Delete from Cloudinary
  if (song.audioPublicId) await cloudinary.uploader.destroy(song.audioPublicId, { resource_type: 'video' });
  if (song.coverPublicId) await cloudinary.uploader.destroy(song.coverPublicId);

  await song.deleteOne();
  res.json({ success: true, message: 'Song deleted successfully' });
});

module.exports = router;
