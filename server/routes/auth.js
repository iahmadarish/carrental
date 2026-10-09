const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Car = require('../models/Car');
const { signToken, setAuthCookie, clearAuthCookie, protect, optionalAuth } = require('../middleware/auth');
const { sendMail, templates } = require('../utils/mailer');
const { asyncHandler, sha256, makeOtp, isEmail, isAuPhone, strongPassword } = require('../utils/helpers');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});

async function issueOtp(user) {
  const code = makeOtp();
  user.otpHash = sha256(code);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  const t = templates.otp(user.name.split(' ')[0], code);
  await sendMail({ to: user.email, ...t });
}

// POST /api/auth/register
router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const { name, email, phone, password, state, marketingOptIn, acceptTerms } = req.body;

  if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Please enter your full name.' });
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (!isAuPhone(phone)) return res.status(400).json({ message: 'Please enter a valid Australian phone number.' });
  if (!strongPassword(password)) {
    return res.status(400).json({ message: 'Password needs at least 8 characters, including a letter and a number.' });
  }
  if (!acceptTerms) return res.status(400).json({ message: 'Please accept the Terms and Privacy Policy.' });

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing && existing.isVerified) {
    return res.status(409).json({ message: 'An account with this email already exists. Please log in.' });
  }

  let user = existing;
  if (user) {
    // unverified account — refresh details and resend code
    Object.assign(user, { name, phone, state: state || '', marketingOptIn: !!marketingOptIn, password });
  } else {
    user = new User({ name, email, phone, password, state: state || '', marketingOptIn: !!marketingOptIn });
  }
  await user.save();
  try {
    await issueOtp(user);
  } catch (err) {
    console.error('📧 Could not send verification email:', err.message);
    return res.status(502).json({
      message: 'Account created, but we couldn’t send the verification email. Please try “Resend code” shortly.',
      email: user.email,
      code: 'EMAIL_FAILED',
    });
  }

  res.status(201).json({ message: 'Account created. We’ve emailed you a 6-digit code.', email: user.email });
}));

// POST /api/auth/verify-otp
router.post('/verify-otp', authLimiter, asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() })
    .select('+otpHash +otpExpires +otpAttempts');
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  if (user.isVerified) return res.json({ message: 'Already verified. Please log in.' });

  if (!user.otpHash || user.otpExpires < new Date()) {
    return res.status(400).json({ message: 'Code expired. Please request a new one.' });
  }
  if (user.otpAttempts >= 5) {
    return res.status(429).json({ message: 'Too many wrong attempts. Please request a new code.' });
  }
  if (sha256(String(code).trim()) !== user.otpHash) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    return res.status(400).json({ message: 'That code isn’t right. Please check and try again.' });
  }

  user.isVerified = true;
  user.otpHash = undefined;
  user.otpExpires = undefined;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendMail({ to: user.email, ...templates.welcome(user.name.split(' ')[0]) }).catch(console.error);

  setAuthCookie(res, signToken(user));
  res.json({ message: 'Email verified. Welcome to VeloDrive!', user: user.toSafeJSON() });
}));

// POST /api/auth/resend-otp
router.post('/resend-otp', authLimiter, asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (user && !user.isVerified) await issueOtp(user);
  res.json({ message: 'If the account exists, a new code is on its way.' });
}));

// POST /api/auth/login
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(String(password || '')))) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }
  if (!user.isVerified) {
    await issueOtp(user);
    return res.status(403).json({ message: 'Please verify your email. We’ve sent a fresh code.', code: 'UNVERIFIED', email: user.email });
  }
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  setAuthCookie(res, signToken(user));
  res.json({ message: 'Welcome back!', user: user.toSafeJSON() });
}));

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out.' });
});

// GET /api/auth/me  — returns { user: null } for guests instead of a 401
router.get('/me', optionalAuth, asyncHandler(async (req, res) => {
  res.json({ user: req.user ? req.user.toSafeJSON() : null });
}));

// PATCH /api/auth/me
router.patch('/me', protect, asyncHandler(async (req, res) => {
  const { name, phone, state, licenceNumber, marketingOptIn } = req.body;
  if (phone !== undefined && !isAuPhone(phone)) return res.status(400).json({ message: 'Invalid Australian phone number.' });
  if (state && !User.AU_STATES.includes(state)) return res.status(400).json({ message: 'Invalid state.' });
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (state !== undefined) req.user.state = state;
  if (licenceNumber !== undefined) req.user.licenceNumber = licenceNumber;
  if (marketingOptIn !== undefined) req.user.marketingOptIn = !!marketingOptIn;
  await req.user.save({ validateBeforeSave: false });
  res.json({ message: 'Profile updated.', user: req.user.toSafeJSON() });
}));

// POST /api/auth/change-password
router.post('/change-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(String(currentPassword || '')))) {
    return res.status(400).json({ message: 'Current password is incorrect.' });
  }
  if (!strongPassword(newPassword)) return res.status(400).json({ message: 'New password is too weak.' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated.' });
}));

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (user) {
    const raw = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = sha256(raw);
    user.resetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    const link = `${process.env.CLIENT_URL}/au/reset?token=${raw}&email=${encodeURIComponent(user.email)}`;
    await sendMail({ to: user.email, ...templates.reset(user.name.split(' ')[0], link) });
  }
  // Same reply either way so emails can't be enumerated
  res.json({ message: 'If an account exists for that email, a reset link is on its way.' });
}));

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;
  if (!strongPassword(password)) {
    return res.status(400).json({ message: 'Password needs at least 8 characters, including a letter and a number.' });
  }
  const user = await User.findOne({
    email: String(email || '').toLowerCase(),
    resetTokenHash: sha256(token || ''),
    resetExpires: { $gt: new Date() },
  }).select('+resetTokenHash +resetExpires');
  if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired.' });

  user.password = password;
  user.resetTokenHash = undefined;
  user.resetExpires = undefined;
  user.isVerified = true; // they proved ownership of the inbox
  await user.save();
  setAuthCookie(res, signToken(user));
  res.json({ message: 'Password reset. You’re now logged in.', user: user.toSafeJSON() });
}));

// GET /api/auth/favourites
router.get('/favourites', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favourites');
  res.json({ cars: user.favourites.filter(Boolean) });
}));

// POST /api/auth/favourites/:carId  (toggle)
router.post('/favourites/:carId', protect, asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.carId);
  if (!car) return res.status(404).json({ message: 'Car not found.' });
  const idx = req.user.favourites.findIndex((id) => id.equals(car._id));
  let saved;
  if (idx >= 0) { req.user.favourites.splice(idx, 1); saved = false; } else { req.user.favourites.push(car._id); saved = true; }
  await req.user.save({ validateBeforeSave: false });
  res.json({ saved, favourites: req.user.favourites });
}));

module.exports = router;
