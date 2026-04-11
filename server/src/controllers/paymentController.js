const Product = require("../models/Product");
const User = require("../models/User");
const PaymentOrder = require("../models/PaymentOrder");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const { initiateSslPayment } = require("../utils/sslCommerz");

const createTransactionId = () =>
  `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

// POST /api/payment/initiate
const initiatePayment = asyncHandler(async (req, res) => {
  const { productId, amount, customerInfo = {} } = req.body;

  if (!productId) {
    return sendResponse(res, 400, false, "productId is required");
  }

  if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
    return sendResponse(
      res,
      400,
      false,
      "customerInfo.name, customerInfo.email and customerInfo.phone are required",
    );
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    return sendResponse(res, 404, false, "Product not found");
  }

  const payableAmount = Number(amount ?? product.price);
  if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
    return sendResponse(res, 400, false, "Valid amount is required");
  }

  let sellerInfo = {
    sellerId: product.sellerId || null,
    sellerName: "",
    shopName: "",
  };

  if (product.sellerId) {
    const seller = await User.findById(product.sellerId)
      .select("name shopName")
      .lean();

    if (seller) {
      sellerInfo = {
        sellerId: seller._id,
        sellerName: seller.name || "",
        shopName: seller.shopName || "",
      };
    }
  }

  const paymentOrder = await PaymentOrder.create({
    transactionId: createTransactionId(),
    productId: product._id,
    amount: payableAmount,
    currency: "BDT",
    status: "pending",
    customerInfo: {
      name: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address: customerInfo.address || "",
      city: customerInfo.city || "",
      postcode: customerInfo.postcode || "",
      country: customerInfo.country || "Bangladesh",
    },
    sellerInfo,
  });

  const paymentSession = await initiateSslPayment(paymentOrder);

  if (!paymentSession.redirectUrl) {
    return sendResponse(
      res,
      502,
      false,
      "Failed to initialize payment gateway",
    );
  }

  paymentOrder.gatewayResponse = paymentSession.gatewayResponse;
  await paymentOrder.save();

  return sendResponse(res, 200, true, "Payment initiated successfully", {
    transactionId: paymentOrder.transactionId,
    redirectUrl: paymentSession.redirectUrl,
    status: paymentOrder.status,
  });
});

// POST /api/payment/success/:transactionId
const paymentSuccess = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const paymentOrder = await PaymentOrder.findOne({ transactionId });
  if (!paymentOrder) {
    return sendResponse(res, 404, false, "Payment order not found");
  }

  paymentOrder.status = "success";
  paymentOrder.gatewayResponse = req.body || null;
  await paymentOrder.save();

  return sendResponse(res, 200, true, "Payment successful", {
    transactionId: paymentOrder.transactionId,
    status: paymentOrder.status,
  });
});

// POST /api/payment/failed/:transactionId
const paymentFailed = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const paymentOrder = await PaymentOrder.findOne({ transactionId });
  if (!paymentOrder) {
    return sendResponse(res, 404, false, "Payment order not found");
  }

  paymentOrder.status = "failed";
  paymentOrder.gatewayResponse = req.body || null;
  await paymentOrder.save();

  return sendResponse(res, 200, true, "Payment failed", {
    transactionId: paymentOrder.transactionId,
    status: paymentOrder.status,
  });
});

// POST /api/payment/cancelled/:transactionId
const paymentCancelled = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const paymentOrder = await PaymentOrder.findOne({ transactionId });
  if (!paymentOrder) {
    return sendResponse(res, 404, false, "Payment order not found");
  }

  paymentOrder.status = "cancelled";
  paymentOrder.gatewayResponse = req.body || null;
  await paymentOrder.save();

  return sendResponse(res, 200, true, "Payment cancelled", {
    transactionId: paymentOrder.transactionId,
    status: paymentOrder.status,
  });
});

module.exports = {
  initiatePayment,
  paymentSuccess,
  paymentFailed,
  paymentCancelled,
};
