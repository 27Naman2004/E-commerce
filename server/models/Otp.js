const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    required: true
  },
  otpHash: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastResentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // TTL: auto-delete after 5 minutes
  }
});

// Compound index to ensure uniqueness per identifier+type combo
otpSchema.index({ identifier: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Otp', otpSchema);
