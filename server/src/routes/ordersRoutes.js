const express = require('express');
const { getMyOrders, reorder } = require('../controllers/ordersController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMyOrders);
router.post('/:orderId/reorder', reorder);

module.exports = router;
