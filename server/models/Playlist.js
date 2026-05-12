const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    coverUrl: {
      type: String,
      default: 'https://picsum.photos/seed/playlist/500/500',
    },
    coverPublicId: { type: String, default: '' },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: true },
    plays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);
