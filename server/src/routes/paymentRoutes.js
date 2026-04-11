const express = require("express");
const {
  initiatePayment,
  paymentSuccess,
  paymentFailed,
  paymentCancelled,
} = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/initiate", protect, initiatePayment);
router.post("/success/:transactionId", paymentSuccess);
router.post("/failed/:transactionId", paymentFailed);
router.post("/cancelled/:transactionId", paymentCancelled);

module.exports = router;
