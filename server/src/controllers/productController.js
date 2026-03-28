const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  return sendResponse(
    res,
    200,
    true,
    "Featured products fetched successfully",
    products,
  );
});

const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    subcategory,
    sort = "featured",
  } = req.query;

  const query = {};

  if (category) {
    query.categorySlug = category;
  }

  if (brand) {
    query.brand = { $in: brand.split(",").map((item) => item.trim()) };
  }

  if (subcategory) {
    query.subcategory = {
      $in: subcategory.split(",").map((item) => item.trim()),
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

  const availableBrands = await Product.distinct("brand", category ? { categorySlug: category } : {});
  const availableSubcategories = await Product.distinct(
    "subcategory",
    category ? { categorySlug: category } : {},
  );
  const priceRange = await Product.aggregate([
    ...(category ? [{ $match: { categorySlug: category } }] : []),
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  return sendResponse(res, 200, true, "Products fetched successfully", {
    products,
    filters: {
      brands: availableBrands.sort(),
      subcategories: availableSubcategories.sort(),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
    },
  });
});

module.exports = { getFeaturedProducts, getProducts };
