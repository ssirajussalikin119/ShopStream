const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const { initiateSslPayment } = require("../utils/sslCommerz");

const createTransactionId = () =>
  `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const createOrderNumber = () =>
  `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const getClientBaseUrl = () => {
  const fromEnv = process.env.CLIENT_BASE_URL;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim().replace(/\/$/, "");

  const fromAllowedOrigin = (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .find(Boolean);

  return (fromAllowedOrigin || "http://localhost:5173").replace(/\/$/, "");
};

const redirectToClientStatus = (res, pagePath, transactionId, status) => {
  const url = `${getClientBaseUrl()}/${pagePath}?tran_id=${encodeURIComponent(
    transactionId,
  )}&status=${encodeURIComponent(status)}`;
  return res.redirect(303, url);
};

// POST /api/payment/initiate
const initiatePayment = asyncHandler(async (req, res) => {
  const { productId, amount, customerInfo = {} } = req.body;

  if (!req.user?._id) {
    return sendResponse(res, 401, false, "Not authorized");
  }

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

  const tax = +(payableAmount * 0.08).toFixed(2);
  const total = +(payableAmount + tax).toFixed(2);

  const order = await Order.create({
    user: req.user._id,
    orderNumber: createOrderNumber(),
    transactionId: createTransactionId(),
    productId: product._id,
    amount: payableAmount,
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
    items: [],
    status: "pending",
    subtotal: payableAmount,
    tax,
    total,
    paymentMethod: "sslcommerz",
  });

  const paymentSession = await initiateSslPayment(order);

  if (!paymentSession.redirectUrl) {
    return sendResponse(
      res,
      502,
      false,
      "Failed to initialize payment gateway",
    );
  }

  return sendResponse(res, 200, true, "Payment initiated successfully", {
    transactionId: order.transactionId,
    redirectUrl: paymentSession.redirectUrl,
    status: order.status,
  });
});

// POST /api/payment/success/:transactionId
const paymentSuccess = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const order = await Order.findOne({ transactionId });
  if (!order) {
    return sendResponse(res, 404, false, "Payment order not found");
  }

  order.status = "confirmed";
  await order.save();

  return redirectToClientStatus(
    res,
    "payment-success",
    order.transactionId,
    "success",
  );
});

// POST /api/payment/failed/:transactionId
const paymentFailed = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const order = await Order.findOne({ transactionId });
  if (!order) {
    return sendResponse(res, 404, false, "Payment order not found");
  }

  order.status = "cancelled";
  await order.save();

  return redirectToClientStatus(
    res,
    "payment-failed",
    order.transactionId,
    "failed",
  );
});

// POST /api/payment/cancelled/:transactionId
const paymentCancelled = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const order = await Order.findOne({ transactionId });
  if (!order) {
    return sendResponse(res, 404, false, "Payment order not found");
  }

  order.status = "cancelled";
  await order.save();

  return redirectToClientStatus(
    res,
    "payment-cancelled",
    order.transactionId,
    "cancelled",
  );
});

module.exports = {
  initiatePayment,
  paymentSuccess,
  paymentFailed,
  paymentCancelled,
};
