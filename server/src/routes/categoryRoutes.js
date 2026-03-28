const express = require("express");
const router = express.Router();
const { getAllCategories } = require("../controllers/categoryController");

// GET /api/categories - Get all categories (public endpoint, no auth required)
router.get("/", getAllCategories);

module.exports = router;
