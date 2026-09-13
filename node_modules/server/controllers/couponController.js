const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    if (!coupon.isActive) {
      res.status(400);
      throw new Error('Coupon is inactive');
    }
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTill) {
      res.status(400);
      throw new Error('Coupon has expired or is not yet valid');
    }
    if (orderTotal < coupon.minOrderValue) {
      res.status(400);
      throw new Error(`Minimum order value for this coupon is ₹${coupon.minOrderValue}`);
    }

    let discountAmount = Math.round((orderTotal * coupon.discountPercent) / 100);
    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);

    res.json({ valid: true, discountPercent: coupon.discountPercent, discountAmount, code: coupon.code });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon (admin)
// @route   POST /api/coupons
const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (admin)
// @route   PUT /api/coupons/:id
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/:id
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { validateCoupon, createCoupon, getCoupons, updateCoupon, deleteCoupon };
