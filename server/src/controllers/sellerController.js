const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

const CATEGORY_CANONICAL = [
  {
    slug: 'electronics',
    name: 'Electronics',
    aliases: ['electronics', 'electronic', 'tech', 'gadgets'],
  },
  {
    slug: 'ebooks',
    name: 'Ebooks',
    aliases: ['ebooks', 'ebook', 'book', 'books'],
  },
  {
    slug: 'software-tools',
    name: 'Softwares',
    aliases: ['software-tools', 'software', 'softwares', 'tools'],
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    aliases: ['accessories', 'accessory'],
  },
];

const normalizeCategory = (rawValue = '') => {
  const categoryName = String(rawValue || '').trim();
  const normalized = slugify(categoryName);

  const canonical = CATEGORY_CANONICAL.find(
    (item) => item.slug === normalized || item.aliases.includes(normalized)
  );

  if (canonical) {
    return {
      categorySlug: canonical.slug,
      categoryName: canonical.name,
    };
  }

  return {
    categorySlug: normalized,
    categoryName,
  };
};

const createSku = (categorySlug) => {
  const prefix = (categorySlug || 'GEN').slice(0, 4).toUpperCase();
  const uniq = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${uniq}-${rand}`;
};

// GET /api/seller/profile
const getSellerProfile = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, true, 'Seller profile fetched successfully', {
    _id: req.user._id,
    shopName: req.user.shopName || '',
    shopLogo: req.user.shopLogo || '',
    email: req.user.email,
    joinedAt: req.user.createdAt,
  });
});

// PUT /api/seller/profile
const updateSellerProfile = asyncHandler(async (req, res) => {
  console.log('[updateSellerProfile] Received request body:', req.body);
  console.log('[updateSellerProfile] User context:', {
    userId: req.user?._id,
    currentEmail: req.user?.email,
    currentShopName: req.user?.shopName,
  });

  const { shopName = '', shopLogo = '', email } = req.body;

  if (email && email !== req.user.email) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id },
    });

    if (existing) {
      console.warn(
        '[updateSellerProfile] Email already in use:',
        normalizedEmail
      );
      return sendResponse(res, 409, false, 'Email is already in use');
    }

    req.user.email = normalizedEmail;
    console.log('[updateSellerProfile] Email updated to:', normalizedEmail);
  }

  req.user.shopName = shopName.trim();
  req.user.shopLogo = shopLogo.trim();
  console.log('[updateSellerProfile] Updated shopName:', req.user.shopName);
  console.log('[updateSellerProfile] Updated shopLogo:', req.user.shopLogo);

  try {
    await req.user.save();
    console.log('[updateSellerProfile] User saved successfully');
  } catch (saveErr) {
    console.error('[updateSellerProfile] Error during save:', saveErr.message);
    throw saveErr;
  }

  console.log(
    '[updateSellerProfile] Sending success response with updated data'
  );
  return sendResponse(res, 200, true, 'Seller profile updated successfully', {
    _id: req.user._id,
    shopName: req.user.shopName,
    shopLogo: req.user.shopLogo,
    email: req.user.email,
    joinedAt: req.user.createdAt,
  });
});

// POST /api/seller/products
const addSellerProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description = '',
    stockQuantity,
    category,
    images = [],
    status = 'published',
  } = req.body;

  if (!name || price == null || stockQuantity == null || !category) {
    return sendResponse(
      res,
      400,
      false,
      'name, price, stockQuantity and category are required'
    );
  }

  const normalizedImages = Array.isArray(images)
    ? images.filter(Boolean)
    : String(images || '')
        .split(',')
        .map((img) => img.trim())
        .filter(Boolean);

  const primaryImage =
    normalizedImages[0] || 'https://via.placeholder.com/600x400?text=Product';
  const { categorySlug, categoryName } = normalizeCategory(category);

  const product = await Product.create({
    sellerId: req.user._id,
    sku: createSku(categorySlug),
    name: name.trim(),
    categorySlug,
    categoryName,
    subcategory: 'General',
    brand: req.user.shopName || req.user.name || 'Seller Store',
    description: description.trim(),
    price: Number(price),
    image: primaryImage,
    images: normalizedImages,
    stockCount: Number(stockQuantity),
    inStock: Number(stockQuantity) > 0,
    isFeatured: false,
    status: status === 'published' ? 'published' : 'draft',
  });

  return sendResponse(res, 201, true, 'Product added successfully', product);
});

const getSoldCountMap = async (productIds) => {
  if (!productIds.length) {
    return {};
  }

  const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));

  const soldRows = await Order.aggregate([
    {
      $match: {
        status: { $in: ['delivered', 'completed'] },
      },
    },
    { $unwind: '$items' },
    {
      $match: {
        'items.productId': { $in: objectIds },
      },
    },
    {
      $group: {
        _id: '$items.productId',
        soldCount: { $sum: '$items.quantity' },
      },
    },
  ]);

  return soldRows.reduce((acc, row) => {
    acc[row._id.toString()] = row.soldCount;
    return acc;
  }, {});
};

// GET /api/seller/products
const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ sellerId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  const soldCountMap = await getSoldCountMap(
    products.map((item) => item._id.toString())
  );

  const withSales = products.map((item) => ({
    ...item,
    soldCount: soldCountMap[item._id.toString()] || 0,
  }));

  return sendResponse(
    res,
    200,
    true,
    'Seller products fetched successfully',
    withSales
  );
});

// PUT /api/seller/products/:productId
const updateSellerProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, price, description, stockQuantity, category, images, status } =
    req.body;

  const product = await Product.findOne({
    _id: productId,
    sellerId: req.user._id,
  });
  if (!product) {
    return sendResponse(res, 404, false, 'Product not found');
  }

  if (name != null) product.name = String(name).trim();
  if (price != null) product.price = Number(price);
  if (description != null) product.description = String(description).trim();

  if (stockQuantity != null) {
    product.stockCount = Number(stockQuantity);
    product.inStock = Number(stockQuantity) > 0;
  }

  if (category != null) {
    const normalizedCategory = normalizeCategory(category);
    product.categoryName = normalizedCategory.categoryName;
    product.categorySlug = normalizedCategory.categorySlug;
  }

  if (images != null) {
    const normalizedImages = Array.isArray(images)
      ? images.filter(Boolean)
      : String(images || '')
          .split(',')
          .map((img) => img.trim())
          .filter(Boolean);

    product.images = normalizedImages;
    if (normalizedImages[0]) {
      product.image = normalizedImages[0];
    }
  }

  if (status != null) {
    product.status = status === 'published' ? 'published' : 'draft';
  }

  await product.save();

  return sendResponse(res, 200, true, 'Product updated successfully', product);
});

// PATCH /api/seller/products/:productId/status
const toggleProductStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findOne({
    _id: productId,
    sellerId: req.user._id,
  });
  if (!product) {
    return sendResponse(res, 404, false, 'Product not found');
  }

  const currentStatus = String(product.status || '').toLowerCase();
  const nextStatus = currentStatus === 'published' ? 'draft' : 'published';

  const normalizedCategory = normalizeCategory(
    product.categorySlug || product.categoryName || ''
  );
  if (normalizedCategory.categorySlug) {
    product.categorySlug = normalizedCategory.categorySlug;
  }
  if (normalizedCategory.categoryName) {
    product.categoryName = normalizedCategory.categoryName;
  }

  product.status = nextStatus;
  await product.save();

  console.log('[toggleProductStatus] Product status updated:', {
    productId: product._id,
    previousStatus: currentStatus,
    nextStatus: product.status,
  });

  return sendResponse(res, 200, true, 'Product status updated', {
    _id: product._id,
    status: product.status,
  });
});

// DELETE /api/seller/products/:productId
const deleteSellerProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const deleted = await Product.findOneAndDelete({
    _id: productId,
    sellerId: req.user._id,
  });

  if (!deleted) {
    return sendResponse(res, 404, false, 'Product not found');
  }

  return sendResponse(res, 200, true, 'Product deleted successfully');
});

module.exports = {
  getSellerProfile,
  updateSellerProfile,
  addSellerProduct,
  getSellerProducts,
  updateSellerProduct,
  toggleProductStatus,
  deleteSellerProduct,
};
