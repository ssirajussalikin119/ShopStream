const express = require("express");
const {
  getFeaturedProducts,
  getProducts,
} = require("../controllers/productController");

const router = express.Router();

// GET /api/products/featured - Fetch products for the home page
router.get("/featured", getFeaturedProducts);
router.get("/", getProducts);

module.exports = router;
