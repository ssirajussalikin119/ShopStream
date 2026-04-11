const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

const escapeRegex = (value = '') =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const PUBLIC_PRODUCT_QUERY = {
  $or: [
    { status: 'published' },
    { status: null },
    { status: { $exists: false } },
  ],
};

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isFeatured: true,
    ...PUBLIC_PRODUCT_QUERY,
  })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  return sendResponse(
    res,
    200,
    true,
    'Featured products fetched successfully',
    products
  );
});

const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    subcategory,
    sort = 'featured',
  } = req.query;

  const query = { ...PUBLIC_PRODUCT_QUERY };

  if (category) {
    query.categorySlug = category;
  }

  if (brand) {
    query.brand = { $in: brand.split(',').map((item) => item.trim()) };
  }

  if (subcategory) {
    query.subcategory = {
      $in: subcategory.split(',').map((item) => item.trim()),
    };
  }

  if (minPrice || maxPrice) {
    query.price = {};

    if (minPrice) {
      query.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      query.price.$lte = Number(maxPrice);
    }
  }

  console.log('[getProducts] Incoming query params:', req.query);
  console.log('[getProducts] Mongo query:', query);

  const sortMap = {
    featured: { isFeatured: -1, createdAt: -1 },
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1, reviewCount: -1 },
  };

  const products = await Product.find(query)
    .sort(sortMap[sort] || sortMap.featured)
    .lean();

  console.log('[getProducts] Result count:', products.length);
  if (products.length > 0) {
    console.log(
      '[getProducts] Result sample:',
      products.slice(0, 5).map((item) => ({
        _id: item._id,
        name: item.name,
        categorySlug: item.categorySlug,
        status: item.status,
      }))
    );
  }

  const filterQuery = {
    ...PUBLIC_PRODUCT_QUERY,
    ...(category ? { categorySlug: category } : {}),
  };

  const availableBrands = await Product.distinct('brand', filterQuery);
  const availableSubcategories = await Product.distinct(
    'subcategory',
    filterQuery
  );
  const priceRange = await Product.aggregate([
    { $match: filterQuery },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  return sendResponse(res, 200, true, 'Products fetched successfully', {
    products,
    filters: {
      brands: availableBrands.sort(),
      subcategories: availableSubcategories.sort(),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
    },
  });
});

const searchProducts = asyncHandler(async (req, res) => {
  const searchKeyword = String(req.query.q || '').trim();

  if (!searchKeyword) {
    return sendResponse(
      res,
      200,
      true,
      'Search results fetched successfully',
      []
    );
  }

  const regex = new RegExp(escapeRegex(searchKeyword), 'i');
  const query = {
    status: 'published',
    $or: [
      { name: regex },
      { description: regex },
      { categoryName: regex },
      { categorySlug: regex },
      { brand: regex },
    ],
  };

  const products = await Product.find(query)
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean();

  return sendResponse(
    res,
    200,
    true,
    'Search results fetched successfully',
    products
  );
});


const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    ...PUBLIC_PRODUCT_QUERY,
  }).lean();

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Fetch related products (same category, excluding this product)
  const related = await Product.find({
    categorySlug: product.categorySlug,
    _id: { $ne: product._id },
    ...PUBLIC_PRODUCT_QUERY,
  })
    .limit(4)
    .lean();

  return sendResponse(res, 200, true, 'Product fetched successfully', {
    product,
    related,
  });
});


const getProductsByIds = asyncHandler(async (req, res) => {
  const { ids } = req.query; // comma-separated product IDs
  if (!ids) {
    return sendResponse(res, 200, true, 'Products fetched', []);
  }
  const idList = ids.split(',').filter(Boolean);
  const products = await Product.find({
    _id: { $in: idList },
    ...PUBLIC_PRODUCT_QUERY,
  }).lean();
  return sendResponse(res, 200, true, 'Products fetched', products);
});

const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('reviews rating reviewCount').lean();
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  return sendResponse(res, 200, true, 'Reviews fetched successfully', product.reviews || []);
});

const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = {
    userId: req.user?._id || null,
    userName: req.user?.name || 'Anonymous',
    rating: Number(rating),
    comment: comment || '',
    createdAt: new Date(),
  };

  product.reviews.push(review);

  // Recalculate rating average
  const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = parseFloat((total / product.reviews.length).toFixed(1));
  product.reviewCount = product.reviews.length;

  await product.save();

  return sendResponse(res, 201, true, 'Review added successfully', review);
});

module.exports = { getFeaturedProducts, getProducts, searchProducts, getProductById, getProductsByIds, getProductReviews, addProductReview };
