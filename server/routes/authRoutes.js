const express = require('express');
const router = express.Router();
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const {
  sendPhoneOtp, verifyPhoneOtp,
  sendEmailOtp, verifyEmailOtp,
  resendOtp, logout, getMe, updateProfile, toggleWishlist,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// OTP send: max 5 per hour per IP
const sendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}-${req.body?.phone || req.body?.email || 'unknown'}`,
  message: { success: false, message: 'Too many OTP requests. Please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP verify: max 10 per 15 mins per IP
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many verification attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Phone OTP
router.post('/send-phone-otp', sendLimiter, sendPhoneOtp);
router.post('/verify-phone-otp', verifyLimiter, verifyPhoneOtp);

// Email OTP
router.post('/send-otp', sendLimiter, sendEmailOtp);
router.post('/verify-otp', verifyLimiter, verifyEmailOtp);
router.post('/send-email-otp', sendLimiter, sendEmailOtp);
router.post('/verify-email-otp', verifyLimiter, verifyEmailOtp);

// Resend (dispatches based on type field in body)
router.post('/resend-otp', sendLimiter, resendOtp);

// Session
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Profile
router.put('/profile', protect, updateProfile);
router.put('/wishlist', protect, toggleWishlist);

module.exports = router;
