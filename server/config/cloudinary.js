const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for audio files
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tunify/audio',
    resource_type: 'video', // Cloudinary uses 'video' type for audio
    allowed_formats: ['mp3', 'wav', 'ogg', 'm4a'],
  },
});

// Storage for cover images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tunify/covers',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', quality: 'auto' }],
  },
});

module.exports = { cloudinary, audioStorage, imageStorage };
