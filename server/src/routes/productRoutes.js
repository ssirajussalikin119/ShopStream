const express = require("express");
const router = express.Router();
const { getAllProducts } = require("../controllers/productController");

// GET /api/products - Get all products with optional filters (public endpoint, no auth required)
router.get("/", getAllProducts);

module.exports = router;
