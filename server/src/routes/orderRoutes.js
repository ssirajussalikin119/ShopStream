const express = require("express");
const { getOrders, getOrder, placeOrder } = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getOrders);
router.get("/:orderId", getOrder);
router.post("/checkout", placeOrder);

module.exports = router;
