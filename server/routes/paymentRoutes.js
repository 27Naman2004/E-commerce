const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
// Webhook - raw body needed for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

module.exports = router;
