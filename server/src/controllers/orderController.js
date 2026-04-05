const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Offer = require("../models/Offer");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");

// GET /api/orders — get current user's order history
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, 200, true, "Orders fetched successfully", orders);
});

// GET /api/orders/:orderId — get a single order
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    orderId: req.params.orderId,
    user: req.user._id,
  }).lean();

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  return sendResponse(res, 200, true, "Order fetched successfully", order);
});

// POST /api/orders/checkout — place order from cart
const placeOrder = asyncHandler(async (req, res) => {
  const { promoCode, shippingAddress, paymentMethod = "card" } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const subtotal = cart.subtotal;
  let discount = 0;

  // Apply promo code if provided
  if (promoCode) {
    const now = new Date();
    const offer = await Offer.findOne({ code: promoCode.toUpperCase() });

    if (offer && offer.isActive && (!offer.expiresAt || now < offer.expiresAt)) {
      if (subtotal >= offer.minOrderAmount) {
        if (offer.discountType === "percentage") {
          discount = +(subtotal * (offer.discountValue / 100)).toFixed(2);
        } else {
          discount = Math.min(offer.discountValue, subtotal);
        }
        // Increment usage
        await Offer.findByIdAndUpdate(offer._id, { $inc: { usedCount: 1 } });
      }
    }
  }

  const tax = +((subtotal - discount) * 0.08).toFixed(2);
  const total = +(subtotal - discount + tax).toFixed(2);

  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const order = await Order.create({
    user: req.user._id,
    orderId,
    items: cart.items,
    subtotal,
    tax,
    discount,
    total,
    promoCode: promoCode || null,
    shippingAddress,
    paymentMethod,
  });

  // Clear cart after checkout
  cart.items = [];
  await cart.save();

  return sendResponse(res, 201, true, "Order placed successfully", order);
});

module.exports = { getOrders, getOrder, placeOrder };
