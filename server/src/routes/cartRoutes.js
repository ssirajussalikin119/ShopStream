const express = require("express");
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  checkout,
} = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get("/", getCart);
router.post("/items", addItem);
router.patch("/items/:productId", updateItem);
router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);
router.post("/checkout", checkout);

module.exports = router;
