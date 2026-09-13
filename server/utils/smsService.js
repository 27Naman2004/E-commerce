/**
 * MSG91 Verify V2 SMS Service
 * 
 * MSG91 manages the OTP entirely on their side — our server never generates,
 * stores, or sees the raw OTP code. This is the most secure approach for SMS OTP.
 * 
 * Setup:
 * 1. Create a MSG91 account: https://msg91.com
 * 2. Go to Verify → Create Template (must be TRAI-approved)
 * 3. Copy your Auth Key and Template ID to .env
 *
 * Docs: https://docs.msg91.com/reference/send-otp
 */

const axios = require('axios');

const MSG91_BASE = 'https://api.msg91.com/api/v5';

/**
 * Send OTP to a phone number via MSG91 Verify
 * @param {string} phone - E.164 format, e.g. "+919876543210"
 */
const sendPhoneOtp = async (phone) => {
  if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_TEMPLATE_ID) {
    throw new Error('MSG91 credentials not configured. Set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID in .env');
  }

  const mobile = phone.replace('+', ''); // MSG91 expects without '+'

  const response = await axios.post(
    `${MSG91_BASE}/otp`,
    {
      template_id: process.env.MSG91_TEMPLATE_ID,
      mobile,
      otp_length: 6,
      otp_expiry: 5, // minutes
    },
    {
      headers: {
        authkey: process.env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.data?.type === 'error') {
    throw new Error(response.data.message || 'Failed to send OTP via SMS');
  }

  return response.data;
};

/**
 * Verify OTP entered by user against MSG91
 * @param {string} phone - E.164 format
 * @param {string} otp - 6-digit code entered by user
 */
const verifyPhoneOtp = async (phone, otp) => {
  if (!process.env.MSG91_AUTH_KEY) {
    throw new Error('MSG91 credentials not configured.');
  }

  const mobile = phone.replace('+', '');

  const response = await axios.get(`${MSG91_BASE}/otp/verify`, {
    params: { mobile, otp },
    headers: {
      authkey: process.env.MSG91_AUTH_KEY,
    },
  });

  if (response.data?.type === 'error') {
    const msg = (response.data.message || '').toLowerCase();
    if (msg.includes('expire')) {
      throw new Error('OTP has expired. Please request a new OTP.');
    }
    if (msg.includes('invalid') || msg.includes('incorrect')) {
      throw new Error('Invalid OTP. Please try again.');
    }
    throw new Error(response.data.message || 'OTP verification failed.');
  }

  return response.data;
};

/**
 * Resend OTP via MSG91 (uses existing session, no new template charge)
 * @param {string} phone - E.164 format
 */
const resendPhoneOtp = async (phone) => {
  if (!process.env.MSG91_AUTH_KEY) {
    throw new Error('MSG91 credentials not configured.');
  }

  const mobile = phone.replace('+', '');

  const response = await axios.get(`${MSG91_BASE}/otp/retry`, {
    params: { mobile, retrytype: 'text' },
    headers: { authkey: process.env.MSG91_AUTH_KEY },
  });

  if (response.data?.type === 'error') {
    throw new Error(response.data.message || 'Failed to resend OTP.');
  }

  return response.data;
};

module.exports = { sendPhoneOtp, verifyPhoneOtp, resendPhoneOtp };
