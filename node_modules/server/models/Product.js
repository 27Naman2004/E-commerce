const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: {
      type: String,
      enum: ['Dress', 'Combo', 'Jewellery', 'Bansuri', 'Accessories'],
      required: true,
    },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discountPercent: {
      type: Number,
      default: function () {
        return Math.round(((this.mrp - this.price) / this.mrp) * 100);
      },
    },
    images: [imageSchema],
    // Laddu Gopal Ji standard sizes: 0 to 5
    sizes: [{ type: String, enum: ['0', '1', '2', '3', '4', '5'] }],
    colors: [String],
    stock: { type: Number, required: true, default: 0 },
    isCombo: { type: Boolean, default: false },
    comboItems: [String],
    tags: [{ type: String, enum: ['janmashtami', 'daily-seva', 'festive', 'winter', 'new-arrival', 'bestseller'] }],
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compute discountPercent whenever price or mrp changes
productSchema.pre('save', function (next) {
  if (this.mrp && this.price) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
