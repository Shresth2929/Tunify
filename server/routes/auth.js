const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({ username, email, password });
  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, user: { id: user._id, username, email, role: user.role } });
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const token = generateToken(user._id);
  res.json({ success: true, token, user: { id: user._id, username: user.username, email, role: user.role } });
});

// @GET /api/auth/me
const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res) => {
  const user = await require('../models/User')
    .findById(req.user._id)
    .select('-password')
    .populate('likedSongs', '_id title artist coverUrl');
  res.json({ success: true, user });
});

// @POST /api/auth/forgotpassword
const crypto = require('crypto');
router.post('/forgotpassword', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'There is no user with that email' });
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // For development/demo without SMTP, we log the token to console
  console.log(`\n=========================================\n`);
  console.log(`PASSWORD RESET TOKEN GENERATED FOR: ${user.email}`);
  console.log(`Token: ${resetToken}`);
  console.log(`Reset URL: http://localhost:5173/reset-password/${resetToken}`);
  console.log(`\n=========================================\n`);

  res.status(200).json({
    success: true,
    message: 'Email sent', // Simulating successful email send
    data: resetToken // We can return it for easy testing in demo apps
  });
});

// @PUT /api/auth/resetpassword/:resettoken
router.put('/resetpassword/:resettoken', async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Return new token so user gets logged in immediately
  const token = generateToken(user._id);
  res.status(200).json({
    success: true,
    token,
    user: { id: user._id, username: user.username, email: user.email, role: user.role }
  });
});



module.exports = router;
