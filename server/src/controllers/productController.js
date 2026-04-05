const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  return sendResponse(res, 200, true, "Featured products fetched successfully", products);
});

const getProducts = asyncHandler(async (req, res) => {
  const { category, brand, minPrice, maxPrice, subcategory, sort = "featured", q, limit } = req.query;

  const query = {};

  if (category) query.categorySlug = category;
  if (brand) query.brand = { $in: brand.split(",").map((item) => item.trim()) };
  if (subcategory) query.subcategory = { $in: subcategory.split(",").map((item) => item.trim()) };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (q) {
    const regex = new RegExp(q.trim(), "i");
    query.$or = [{ name: regex }, { description: regex }, { brand: regex }, { subcategory: regex }, { categoryName: regex }];
  }

  const sortMap = {
    featured: { isFeatured: -1, createdAt: -1 },
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1, reviewCount: -1 },
  };

  let queryBuilder = Product.find(query).sort(sortMap[sort] || sortMap.featured);
  if (limit) queryBuilder = queryBuilder.limit(Number(limit));
  const products = await queryBuilder.lean();

  const filterBase = category ? { categorySlug: category } : {};
  const availableBrands = await Product.distinct("brand", filterBase);
  const availableSubcategories = await Product.distinct("subcategory", filterBase);
  const priceRange = await Product.aggregate([
    ...(category ? [{ $match: { categorySlug: category } }] : []),
    { $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } },
  ]);

  return sendResponse(res, 200, true, "Products fetched successfully", {
    products,
    filters: { brands: availableBrands.sort(), subcategories: availableSubcategories.sort(), priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 } },
  });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) { res.status(404); throw new Error("Product not found"); }
  const related = await Product.find({ categorySlug: product.categorySlug, _id: { $ne: product._id } }).limit(4).lean();
  return sendResponse(res, 200, true, "Product fetched successfully", { product, related });
});

module.exports = { getFeaturedProducts, getProducts, getProductById };
