require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const User = require('../models/User');

const connectDB = require('../config/db');

// 30 seed songs with real free audio samples from SoundHelix + Unsplash covers
const songs = [
  // POP
  {
    title: 'Electric Dream',
    artist: 'Nova Pulse',
    album: 'Neon Horizons',
    genre: 'Pop',
    duration: 214,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://picsum.photos/seed/pop1/500/500',
  },
  {
    title: 'Midnight Rush',
    artist: 'Stella Ray',
    album: 'After Hours',
    genre: 'Pop',
    duration: 198,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://picsum.photos/seed/pop2/500/500',
  },
  {
    title: 'Golden Hour',
    artist: 'Aria Banks',
    album: 'Sunset Boulevard',
    genre: 'Pop',
    duration: 223,
    year: 2022,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://picsum.photos/seed/pop3/500/500',
  },
  {
    title: 'Breathe Again',
    artist: 'Lena Shore',
    album: 'Lungs',
    genre: 'Pop',
    duration: 187,
    year: 2024,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://picsum.photos/seed/pop4/500/500',
  },
  {
    title: 'Neon Lights',
    artist: 'The Velvet Sun',
    album: 'City Pop',
    genre: 'Pop',
    duration: 205,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://picsum.photos/seed/pop5/500/500',
  },

  // ROCK
  {
    title: 'Thunder Road',
    artist: 'Ironclad',
    album: 'Steel & Fire',
    genre: 'Rock',
    duration: 256,
    year: 2022,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://picsum.photos/seed/rock1/500/500',
  },
  {
    title: 'Shattered Glass',
    artist: 'The Broken Few',
    album: 'Remnants',
    genre: 'Rock',
    duration: 243,
    year: 2021,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://picsum.photos/seed/rock2/500/500',
  },
  {
    title: 'Wildfire',
    artist: 'Cascade',
    album: 'Blaze',
    genre: 'Rock',
    duration: 218,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://picsum.photos/seed/rock3/500/500',
  },
  {
    title: 'Broken Chains',
    artist: 'Volt Strike',
    album: 'Unbound',
    genre: 'Rock',
    duration: 267,
    year: 2020,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverUrl: 'https://picsum.photos/seed/rock4/500/500',
  },

  // HIP-HOP
  {
    title: 'Street Anthem',
    artist: 'K-Vizion',
    album: 'Urban Canvas',
    genre: 'Hip-Hop',
    duration: 195,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    coverUrl: 'https://picsum.photos/seed/hiphop1/500/500',
  },
  {
    title: 'City Lights Flow',
    artist: 'Phantom Bars',
    album: 'Concrete Poetry',
    genre: 'Hip-Hop',
    duration: 208,
    year: 2022,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    coverUrl: 'https://picsum.photos/seed/hiphop2/500/500',
  },
  {
    title: 'Hustle Season',
    artist: 'Prime Cipher',
    album: 'Grind Mode',
    genre: 'Hip-Hop',
    duration: 213,
    year: 2024,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    coverUrl: 'https://picsum.photos/seed/hiphop3/500/500',
  },
  {
    title: 'Real Talk',
    artist: 'Aeon MC',
    album: 'Frequency',
    genre: 'Hip-Hop',
    duration: 188,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    coverUrl: 'https://picsum.photos/seed/hiphop4/500/500',
  },

  // JAZZ
  {
    title: 'Blue Velvet Night',
    artist: 'Marco DeLuca Quartet',
    album: 'Late Sessions',
    genre: 'Jazz',
    duration: 312,
    year: 2021,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    coverUrl: 'https://picsum.photos/seed/jazz1/500/500',
  },
  {
    title: 'Smooth Resolve',
    artist: 'The Ivory Keys',
    album: 'Brushstrokes',
    genre: 'Jazz',
    duration: 278,
    year: 2022,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    coverUrl: 'https://picsum.photos/seed/jazz2/500/500',
  },
  {
    title: 'Café Minuit',
    artist: 'Sable Trio',
    album: 'Parisian Moods',
    genre: 'Jazz',
    duration: 295,
    year: 2020,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
    coverUrl: 'https://picsum.photos/seed/jazz3/500/500',
  },
  {
    title: 'Autumn Haze',
    artist: 'Reed & Flow',
    album: 'Seasons',
    genre: 'Jazz',
    duration: 324,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
    coverUrl: 'https://picsum.photos/seed/jazz4/500/500',
  },

  // ELECTRONIC
  {
    title: 'Pulse Code',
    artist: 'SYNTH_X',
    album: 'Digital Aura',
    genre: 'Electronic',
    duration: 384,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://picsum.photos/seed/elec1/500/500',
  },
  {
    title: 'Waveform',
    artist: 'Circuit Break',
    album: 'Frequency Shift',
    genre: 'Electronic',
    duration: 356,
    year: 2022,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://picsum.photos/seed/elec2/500/500',
  },
  {
    title: 'Binary Sunset',
    artist: 'Datamosh',
    album: 'Cascade Effect',
    genre: 'Electronic',
    duration: 412,
    year: 2024,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://picsum.photos/seed/elec3/500/500',
  },
  {
    title: 'Phase Shift',
    artist: 'Ambient Code',
    album: 'Drift',
    genre: 'Electronic',
    duration: 368,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://picsum.photos/seed/elec4/500/500',
  },

  // CLASSICAL
  {
    title: 'Sonata in D Minor',
    artist: 'Elena Vasilyeva',
    album: 'Piano Works Vol. I',
    genre: 'Classical',
    duration: 445,
    year: 2021,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://picsum.photos/seed/class1/500/500',
  },
  {
    title: 'Prelude No. 3',
    artist: 'Marcus Holt',
    album: 'Études',
    genre: 'Classical',
    duration: 287,
    year: 2020,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://picsum.photos/seed/class2/500/500',
  },
  {
    title: 'Adagio for Strings',
    artist: 'Vienna Chamber Ensemble',
    album: 'Orchestral Gems',
    genre: 'Classical',
    duration: 512,
    year: 2019,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://picsum.photos/seed/class3/500/500',
  },

  // R&B
  {
    title: 'Feel It All',
    artist: 'Jade Monroe',
    album: 'Velvet Season',
    genre: 'R&B',
    duration: 224,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://picsum.photos/seed/rnb1/500/500',
  },
  {
    title: 'Stay With Me Tonight',
    artist: 'Darius Blue',
    album: 'Midnight Confessions',
    genre: 'R&B',
    duration: 237,
    year: 2022,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverUrl: 'https://picsum.photos/seed/rnb2/500/500',
  },
  {
    title: 'Slow Burn',
    artist: 'Nia & The Soulcats',
    album: 'Ember',
    genre: 'R&B',
    duration: 261,
    year: 2024,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    coverUrl: 'https://picsum.photos/seed/rnb3/500/500',
  },
  {
    title: 'Gravity Pull',
    artist: 'Remi Soulé',
    album: 'Weightless',
    genre: 'R&B',
    duration: 248,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    coverUrl: 'https://picsum.photos/seed/rnb4/500/500',
  },
  {
    title: 'Tender Love',
    artist: 'Zora James',
    album: 'Simple Truth',
    genre: 'R&B',
    duration: 213,
    year: 2022,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    coverUrl: 'https://picsum.photos/seed/rnb5/500/500',
  },
  // NEW LO-FI
  {
    title: 'Lo-Fi Chill',
    artist: 'Luna Mist',
    album: 'Moonlight Beats',
    genre: 'Lo-fi',
    duration: 185,
    year: 2024,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    coverUrl: 'https://picsum.photos/seed/lofi1/500/500',
  },
  {
    title: 'Midnight Coffee',
    artist: 'Urban Echo',
    album: 'City Nights',
    genre: 'Lo-fi',
    duration: 192,
    year: 2024,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
    coverUrl: 'https://picsum.photos/seed/lofi2/500/500',
  },
  // NEW AMBIENT
  {
    title: 'Distant Stars',
    artist: 'Nova Flare',
    album: 'Galactic Drift',
    genre: 'Ambient',
    duration: 320,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://picsum.photos/seed/ambient1/500/500',
  },
  {
    title: 'Ocean Breeze',
    artist: 'Tidal Waves',
    album: 'Serenity',
    genre: 'Ambient',
    duration: 410,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverUrl: 'https://picsum.photos/seed/ambient2/500/500',
  },
  // NEW ELECTRONIC
  {
    title: 'Neon Samurai',
    artist: 'Cyber Soul',
    album: 'Synth City',
    genre: 'Electronic',
    duration: 245,
    year: 2024,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://picsum.photos/seed/elec5/500/500',
  },
  {
    title: 'Glitch in Reality',
    artist: 'Signal Lost',
    album: 'System Failure',
    genre: 'Electronic',
    duration: 210,
    year: 2024,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://picsum.photos/seed/elec6/500/500',
  },
  // NEW CINEMATIC
  {
    title: 'Deep Forest',
    artist: 'Rooted',
    album: 'Earth Tones',
    genre: 'Cinematic',
    duration: 298,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://picsum.photos/seed/cine1/500/500',
  },
  {
    title: 'Epic Journey',
    artist: 'Hero\'s Path',
    album: 'The Odyssey',
    genre: 'Cinematic',
    duration: 350,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://picsum.photos/seed/cine2/500/500',
  },
  // NEW R&B/SOUL
  {
    title: 'Vintage Soul',
    artist: 'The Retro Group',
    album: 'Soulful Echoes',
    genre: 'R&B',
    duration: 235,
    year: 2022,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://picsum.photos/seed/rnb6/500/500',
  },
  {
    title: 'Smooth Operator',
    artist: 'Silk Road',
    album: 'Velvet Sessions',
    genre: 'Jazz',
    duration: 268,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://picsum.photos/seed/jazz5/500/500',
  },
  // NEW POP
  {
    title: 'Summer Rain',
    artist: 'Cloud Nine',
    album: 'Sky High',
    genre: 'Pop',
    duration: 215,
    year: 2024,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://picsum.photos/seed/pop6/500/500',
  },
  {
    title: 'Velvet Sky',
    artist: 'Aura',
    album: 'Prism',
    genre: 'Pop',
    duration: 198,
    year: 2024,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://picsum.photos/seed/pop7/500/500',
  },
  // NEW ROCK
  {
    title: 'Hard Hitter',
    artist: 'Titan',
    album: 'Heavy Weight',
    genre: 'Rock',
    duration: 242,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    coverUrl: 'https://picsum.photos/seed/rock5/500/500',
  },
  {
    title: 'Desert Storm',
    artist: 'Mirage',
    album: 'Sand Dunes',
    genre: 'Rock',
    duration: 275,
    year: 2023,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    coverUrl: 'https://picsum.photos/seed/rock6/500/500',
  },
  {
    title: 'Lounge Vibes',
    artist: 'Chilled Soul',
    album: 'Lazy Afternoons',
    genre: 'Jazz',
    duration: 310,
    year: 2022,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    coverUrl: 'https://picsum.photos/seed/jazz6/500/500',
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Song.deleteMany({});
    await Playlist.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`👤 Admin created: ${admin.email}`);

    // Insert songs
    const insertedSongs = await Song.insertMany(songs);
    console.log(`🎵 Inserted ${insertedSongs.length} songs`);

    // Create sample playlists
    const popSongs = insertedSongs.filter((s) => s.genre === 'Pop').map((s) => s._id);
    const rockSongs = insertedSongs.filter((s) => s.genre === 'Rock').map((s) => s._id);
    const jazzSongs = insertedSongs.filter((s) => s.genre === 'Jazz').map((s) => s._id);
    const electronicSongs = insertedSongs.filter((s) => s.genre === 'Electronic').map((s) => s._id);
    const allSongs = insertedSongs.map((s) => s._id);

    await Playlist.insertMany([
      {
        name: 'Top Hits 2024',
        description: 'The hottest tracks of 2024',
        coverUrl: 'https://picsum.photos/seed/playlist1/500/500',
        songs: allSongs.slice(0, 8),
        createdBy: admin._id,
        isPublic: true,
      },
      {
        name: 'Pop Vibes',
        description: 'Feel-good pop anthems',
        coverUrl: 'https://picsum.photos/seed/playlist2/500/500',
        songs: popSongs,
        createdBy: admin._id,
        isPublic: true,
      },
      {
        name: 'Rock Legends',
        description: 'Powerful rock anthems',
        coverUrl: 'https://picsum.photos/seed/playlist3/500/500',
        songs: rockSongs,
        createdBy: admin._id,
        isPublic: true,
      },
      {
        name: 'Jazz After Dark',
        description: 'Smooth jazz for late nights',
        coverUrl: 'https://picsum.photos/seed/playlist4/500/500',
        songs: jazzSongs,
        createdBy: admin._id,
        isPublic: true,
      },
      {
        name: 'Electronic Pulse',
        description: 'High-energy electronic music',
        coverUrl: 'https://picsum.photos/seed/playlist5/500/500',
        songs: electronicSongs,
        createdBy: admin._id,
        isPublic: true,
      },
    ]);

    console.log('🎶 Sample playlists created');
    console.log('\n✅ Database seeded successfully!');
    console.log(`\n📧 Admin Login:\n   Email: ${admin.email}\n   Password: ${process.env.ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedDB();
