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
router
  .route("/success/:transactionId")
  .post(paymentSuccess)
  .get(paymentSuccess);
router.route("/failed/:transactionId").post(paymentFailed).get(paymentFailed);
router
  .route("/cancelled/:transactionId")
  .post(paymentCancelled)
  .get(paymentCancelled);

module.exports = router;
