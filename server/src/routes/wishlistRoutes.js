const express = require('express');
const {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
} = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/items', addWishlistItem);
router.delete('/items/:productId', removeWishlistItem);

module.exports = router;
