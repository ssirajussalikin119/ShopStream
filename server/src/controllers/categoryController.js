const Category = require("../models/Category");
const sendResponse = require("../utils/sendResponse");
const asyncHandler = require("../utils/asyncHandler");

// GET ALL CATEGORIES - Fetch all categories from database
const getAllCategories = asyncHandler(async (req, res) => {
  // Find all active categories and sort by name
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  return sendResponse(res, 200, true, "Categories fetched successfully", {
    count: categories.length,
    data: categories,
  });
});

module.exports = { getAllCategories };
