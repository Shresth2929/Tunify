const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    album: { type: String, default: 'Unknown Album', trim: true },
    genre: {
      type: String,
      enum: [
        'Pop', 'Rock', 'HipHop', 'Hip-Hop', 'Jazz', 'Electronic', 'Techno',
        'Classical', 'R&B', 'Country', 'Latin', 'Lo-Fi', 'Lo-fi', 'Ambient',
        'Cinematic', 'Other'
      ],
      default: 'Other',
    },
    duration: { type: Number, default: 0 }, // in seconds
    audioUrl: { type: String, required: true },
    audioPublicId: { type: String, default: '' },
    coverUrl: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1/tunify/covers/default_cover',
    },
    coverPublicId: { type: String, default: '' },
    plays: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    year: { type: Number, default: new Date().getFullYear() },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

songSchema.index({ title: 'text', artist: 'text', album: 'text' });

module.exports = mongoose.model('Song', songSchema);
