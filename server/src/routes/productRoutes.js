const express = require('express');
const {
  getFeaturedProducts,
  getProducts,
  searchProducts,
  getProductById,
  getProductsByIds,
  getProductReviews,
  addProductReview,
} = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/by-ids', getProductsByIds);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, addProductReview);

module.exports = router;
