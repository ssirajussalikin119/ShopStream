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

module.exports = { getFeaturedProducts, getProducts, searchProducts };
