const express = require('express');
const {
  getSellerProfile,
  updateSellerProfile,
  addSellerProduct,
  getSellerProducts,
  updateSellerProduct,
  toggleProductStatus,
  deleteSellerProduct,
} = require('../controllers/sellerController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles(ROLES.SELLER, ROLES.ADMIN));

router.get('/profile', getSellerProfile);
router.put('/profile', updateSellerProfile);

router.get('/products', getSellerProducts);
router.post('/products', addSellerProduct);
router.put('/products/:productId', updateSellerProduct);
router.patch('/products/:productId/status', toggleProductStatus);
router.delete('/products/:productId', deleteSellerProduct);

module.exports = router;
