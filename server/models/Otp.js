const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: true
  },
  identifier: {
    type: String,
    index: true
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    default: 'email'
  },
  otpHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  },
  lastResentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300
  }
});

otpSchema.index({ identifier: 1, type: 1 }, { unique: true });
otpSchema.index({ email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Otp', otpSchema);
