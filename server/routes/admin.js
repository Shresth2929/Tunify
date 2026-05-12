const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  const [totalSongs, totalPlaylists, totalUsers, topSongs] = await Promise.all([
    Song.countDocuments({ isActive: true }),
    Playlist.countDocuments(),
    User.countDocuments(),
    Song.find({ isActive: true }).sort('-plays').limit(5).select('title artist plays coverUrl'),
  ]);

  const genreBreakdown = await Song.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    stats: { totalSongs, totalPlaylists, totalUsers, topSongs, genreBreakdown },
  });
});

module.exports = router;
