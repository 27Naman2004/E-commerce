const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { getOtpEmailTemplate } = require('../utils/emailTemplates');
const { sendPhoneOtp: msg91Send, verifyPhoneOtp: msg91Verify, resendPhoneOtp: msg91Resend } = require('../utils/smsService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateSecureOtp = () => {
  // Cryptographically secure 6-digit OTP
  const buf = crypto.randomBytes(4);
  const num = buf.readUInt32BE(0) % 900000 + 100000;
  return num.toString();
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const setTokenCookie = (res, userId) => {
  const token = generateAccessToken(userId);
  res.cookie('token', token, cookieOptions);
  return token;
};

const buildUserResponse = (user, token) => ({
  _id: user._id,
  name: user.name || null,
  email: user.email || null,
  phone: user.phone || null,
  emailVerified: user.emailVerified,
  phoneVerified: user.phoneVerified,
  role: user.role,
  accessToken: token,
});

const findOrCreateUser = async (query, verifyField) => {
  let user = await User.findOne(query);
  if (!user) {
    user = await User.create({ ...query, [verifyField]: true });
  } else {
    // Mark as verified if not already
    if (!user[verifyField]) {
      user[verifyField] = true;
      await user.save();
    }
  }
  return user;
};

// ─── PHONE OTP ────────────────────────────────────────────────────────────────

// @route POST /api/auth/send-phone-otp
const sendPhoneOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Backend validation (never trust frontend)
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      res.status(400);
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }

    await msg91Send(phone);

    res.json({ message: 'OTP sent to your phone successfully.' });
  } catch (err) {
    // Distinguish provider errors from validation errors
    if (err.response?.data || err.message?.includes('MSG91')) {
      next(Object.assign(new Error('Unable to send OTP. Please try again.'), { status: 502 }));
    } else {
      next(err);
    }
  }
};

// @route POST /api/auth/verify-phone-otp
const verifyPhoneOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400);
      throw new Error('Phone number and OTP are required.');
    }

    // Verify via MSG91 (they track attempts and expiry on their end)
    await msg91Verify(phone, otp.toString().trim());

    // Create or login user
    const user = await findOrCreateUser({ phone }, 'phoneVerified');
    const token = setTokenCookie(res, user._id);

    res.json(buildUserResponse(user, token));
  } catch (err) {
    next(err);
  }
};

// ─── EMAIL OTP ────────────────────────────────────────────────────────────────

// @route POST /api/auth/send-email-otp
const sendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Backend email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please enter a valid email address.');
    }

    // Rate: check resend cooldown (60 seconds)
    const existing = await Otp.findOne({ identifier: email.toLowerCase(), type: 'email' });
    if (existing?.lastResentAt) {
      const elapsed = (Date.now() - existing.lastResentAt.getTime()) / 1000;
      if (elapsed < 60) {
        res.status(429);
        throw new Error(`Please wait ${Math.ceil(60 - elapsed)} seconds before requesting another OTP.`);
      }
    }

    const otpCode = generateSecureOtp();
    const otpHash = await bcrypt.hash(otpCode, 10);

    // Upsert OTP record (resets TTL)
    await Otp.findOneAndUpdate(
      { identifier: email.toLowerCase(), type: 'email' },
      { identifier: email.toLowerCase(), type: 'email', otpHash, attempts: 0, lastResentAt: new Date(), createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send branded email via Resend
    await sendEmail({
      to: email,
      subject: 'Your OTP for Kanha Collection 🪷',
      html: getOtpEmailTemplate({ otp: otpCode }),
    });

    res.json({ message: 'OTP sent to your email address.' });
  } catch (err) {
    if (err.message?.includes('Resend') || err.message?.includes('Failed to send email')) {
      next(Object.assign(new Error('Unable to send OTP email. Please try again.'), { status: 502 }));
    } else {
      next(err);
    }
  }
};

// @route POST /api/auth/verify-email-otp
const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      throw new Error('Email and OTP are required.');
    }

    const otpRecord = await Otp.findOne({ identifier: email.toLowerCase(), type: 'email' });

    // If no record → expired (TTL deleted it)
    if (!otpRecord) {
      res.status(400);
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    // Max 5 attempts
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ identifier: email.toLowerCase(), type: 'email' });
      res.status(429);
      throw new Error('Too many incorrect attempts. Please request a new OTP.');
    }

    const isMatch = await bcrypt.compare(otp.toString().trim(), otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      res.status(400);
      throw new Error(`Invalid OTP. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new OTP.'}`);
    }

    // Success — delete OTP immediately
    await Otp.deleteOne({ identifier: email.toLowerCase(), type: 'email' });

    const user = await findOrCreateUser({ email: email.toLowerCase() }, 'emailVerified');
    const token = setTokenCookie(res, user._id);

    res.json(buildUserResponse(user, token));
  } catch (err) {
    next(err);
  }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────

// @route POST /api/auth/resend-otp
const resendOtp = async (req, res, next) => {
  const { type } = req.body;
  if (type === 'phone') {
    return sendPhoneOtp(req, res, next);
  }
  return sendEmailOtp(req, res, next);
};

// ─── SESSION ──────────────────────────────────────────────────────────────────

// @route POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out successfully.' });
};

// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ─── PROFILE ─────────────────────────────────────────────────────────────────

// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error('User not found'); }

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.addresses) user.addresses = req.body.addresses;

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      emailVerified: updated.emailVerified,
      phoneVerified: updated.phoneVerified,
      role: updated.role,
      addresses: updated.addresses,
    });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/auth/wishlist
const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.body;
    const idx = user.wishlist.indexOf(productId);
    if (idx === -1) user.wishlist.push(productId);
    else user.wishlist.splice(idx, 1);
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailOtp,
  verifyEmailOtp,
  resendOtp,
  logout,
  getMe,
  updateProfile,
  toggleWishlist,
};
