const Product = require('../models/Product');
const Review = require('../models/Review');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products with filters, sort, pagination
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, size, color, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const query = {};
    if (keyword) query.name = { $regex: keyword, $options: 'i' };
    if (category) query.category = category;
    if (size) query.sizes = size;
    if (color) query.colors = { $in: [color] };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      popularity: { ratings: -1 },
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortBy).skip(skip).limit(limitNum);

    res.json({ products, page: pageNum, pages: Math.ceil(total / limitNum), total });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const reviews = await Review.find({ product: product._id }).populate('user', 'name');
    res.json({ product, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, slug, description, shortDescription, category, price, mrp, sizes, colors, stock, isCombo, comboItems, tags, isFeatured, isBestSeller } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        images.push(result);
      }
    }

    const product = await Product.create({
      name, slug, description, shortDescription, category, price: Number(price),
      mrp: Number(mrp), sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [], stock: Number(stock),
      isCombo: isCombo === 'true', comboItems: comboItems ? JSON.parse(comboItems) : [],
      tags: tags ? JSON.parse(tags) : [], isFeatured: isFeatured === 'true',
      isBestSeller: isBestSeller === 'true', images,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const fields = ['name', 'description', 'shortDescription', 'category', 'price', 'mrp', 'stock', 'isCombo', 'isFeatured', 'isBestSeller'];
    fields.forEach((f) => { if (req.body[f] !== undefined) product[f] = req.body[f]; });

    if (req.body.sizes) product.sizes = JSON.parse(req.body.sizes);
    if (req.body.colors) product.colors = JSON.parse(req.body.colors);
    if (req.body.tags) product.tags = JSON.parse(req.body.tags);
    if (req.body.comboItems) product.comboItems = JSON.parse(req.body.comboItems);

    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
      product.images = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        product.images.push(result);
      }
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a product
// @route   POST /api/products/:id/reviews
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const existingReview = await Review.findOne({ user: req.user._id, product: product._id });
    if (existingReview) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    const review = await Review.create({ user: req.user._id, product: product._id, rating: Number(rating), comment });

    // Update product rating stats
    const reviews = await Review.find({ product: product._id });
    product.numReviews = reviews.length;
    product.ratings = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await product.save();

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured + bestseller products
// @route   GET /api/products/featured
const getFeaturedProducts = async (req, res, next) => {
  try {
    const featured = await Product.find({ isFeatured: true }).limit(8);
    const bestSellers = await Product.find({ isBestSeller: true }).limit(8);
    res.json({ featured, bestSellers });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, addReview, getFeaturedProducts };
