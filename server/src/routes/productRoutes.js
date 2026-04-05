const express = require("express");
const { getFeaturedProducts, getProducts, getProductById } = require("../controllers/productController");

const router = express.Router();

router.get("/featured", getFeaturedProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
