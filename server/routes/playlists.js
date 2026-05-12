const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');

// Configure multer for playlist covers
const upload = multer({
  storage: multer.memoryStorage(),
}).fields([{ name: 'cover', maxCount: 1 }]);

// @GET /api/playlists
router.get('/', async (req, res) => {
  const playlists = await Playlist.find({ isPublic: true })
    .populate('songs', 'title artist coverUrl duration audioUrl')
    .sort('-createdAt');
  res.json({ success: true, playlists });
});

// @GET /api/playlists/my
router.get('/my', protect, async (req, res) => {
  const playlists = await Playlist.find({ createdBy: req.user._id })
    .populate('songs', 'title artist coverUrl duration audioUrl')
    .sort('-createdAt');
  res.json({ success: true, playlists });
});

// @GET /api/playlists/:id
router.get('/:id', async (req, res) => {
  const playlist = await Playlist.findById(req.params.id)
    .populate('songs', 'title artist album coverUrl duration audioUrl genre plays');
  if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
  res.json({ success: true, playlist });
});

// @POST /api/playlists — create playlist
router.post('/', protect, (req, res, next) => {
  // Accept both JSON and multipart/form-data
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    upload(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  const { name, description, isPublic, coverUrl } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  let finalCoverUrl = coverUrl || `https://picsum.photos/seed/${Date.now()}/500/500`;
  let coverPublicId = '';

  if (req.files?.cover) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'tunify/playlist-covers', resource_type: 'image' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.files.cover[0].buffer);
      });
      finalCoverUrl = result.secure_url;
      coverPublicId = result.public_id;
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
    }
  }

  const playlist = await Playlist.create({
    name,
    description: description || '',
    isPublic: isPublic !== undefined ? (String(isPublic) !== 'false') : true,
    coverUrl: finalCoverUrl,
    coverPublicId,
    createdBy: req.user._id,
  });

  // Link playlist to user
  await User.findByIdAndUpdate(req.user._id, { $push: { playlists: playlist._id } });

  res.status(201).json({ success: true, playlist });
});


// @PUT /api/playlists/:id
router.put('/:id', protect, async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });

  // Ownership check
  if (playlist.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this playlist' });
  }

  const { name, description, isPublic } = req.body;
  if (name) playlist.name = name;
  if (description !== undefined) playlist.description = description;
  if (isPublic !== undefined) playlist.isPublic = isPublic;

  await playlist.save();
  res.json({ success: true, playlist });
});

// @DELETE /api/playlists/:id
router.delete('/:id', protect, async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });

  // Ownership check
  if (playlist.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this playlist' });
  }

  if (playlist.coverPublicId) await cloudinary.uploader.destroy(playlist.coverPublicId);
  await playlist.deleteOne();
  res.json({ success: true, message: 'Playlist deleted' });
});

// @POST /api/playlists/:id/songs — add songs
router.post('/:id/songs', protect, async (req, res) => {
  const { songIds } = req.body; // array
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });

  // Ownership check
  if (playlist.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to modify this playlist' });
  }

  const toAdd = (Array.isArray(songIds) ? songIds : [songIds]).filter(
    (id) => !playlist.songs.map(String).includes(String(id))
  );
  playlist.songs.push(...toAdd);
  await playlist.save();
  res.json({ success: true, playlist });
});

// @DELETE /api/playlists/:id/songs/:songId — remove song
router.delete('/:id/songs/:songId', protect, async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });

  // Ownership check
  if (playlist.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to modify this playlist' });
  }

  playlist.songs = playlist.songs.filter((s) => String(s) !== req.params.songId);
  await playlist.save();
  res.json({ success: true, playlist });
});

module.exports = router;
