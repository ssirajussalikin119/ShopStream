const express = require('express');
const {
  getFeaturedProducts,
  getProducts,
  searchProducts,
  getProductById,
  getProductsByIds,
} = require('../controllers/productController');

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/by-ids', getProductsByIds);
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
