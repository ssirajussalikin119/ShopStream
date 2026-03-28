const Product = require("../models/Product");
const sendResponse = require("../utils/sendResponse");
const asyncHandler = require("../utils/asyncHandler");

// GET ALL PRODUCTS - Fetch products with optional filters
const getAllProducts = asyncHandler(async (req, res) => {
  // Extract query parameters
  const { featured, limit = 10, skip = 0 } = req.query;

  // Build filter object
  let filter = { isActive: true };

  // If featured=true, only get featured products
  if (featured === "true") {
    filter.isFeatured = true;
  }

  // Find products matching filter, with pagination
  const products = await Product.find(filter)
    .populate("category", "name slug") // Include category details
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ createdAt: -1 }); // Newest first

  // Get total count for pagination info
  const totalCount = await Product.countDocuments(filter);

  return sendResponse(res, 200, true, "Products fetched successfully", {
    count: products.length,
    total: totalCount,
    data: products,
  });
});

module.exports = { getAllProducts };
