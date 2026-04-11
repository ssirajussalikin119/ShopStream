const express = require('express');
const { reorder } = require('../controllers/ordersController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

// POST /api/orders/:orderId/reorder
router.post('/:orderId/reorder', reorder);

module.exports = router;
