const Order = require('../models/Order');
const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

// GET /api/orders - list all orders for current user
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, 200, true, 'Orders fetched successfully', orders);
});

// POST /api/orders/:orderId/reorder - copy items from an old order to cart
const reorder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  }).lean();
  if (!order) {
    return sendResponse(res, 404, false, 'Order not found');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  for (const oldItem of order.items) {
    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === oldItem.productId.toString()
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += oldItem.quantity;
    } else {
      cart.items.push({
        productId: oldItem.productId,
        sku: oldItem.sku,
        name: oldItem.name,
        image: oldItem.image,
        brand: oldItem.brand,
        price: oldItem.price,
        compareAtPrice: oldItem.compareAtPrice,
        quantity: oldItem.quantity,
      });
    }
  }

  await cart.save();

  return sendResponse(res, 200, true, 'Items added to cart from order', cart);
});

module.exports = { getMyOrders, reorder };
