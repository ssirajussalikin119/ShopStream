const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

// Helper: get or create cart for user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// GET /api/cart  — fetch current user's cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  return sendResponse(res, 200, true, 'Cart fetched successfully', cart);
});

// POST /api/cart/items  — add or increment an item
const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('productId is required');
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!product.inStock || product.stockCount < 1) {
    res.status(400);
    throw new Error('Product is out of stock');
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingIndex = cart.items.findIndex(
    (i) => i.productId.toString() === productId
  );

  if (existingIndex >= 0) {
    const newQty = cart.items[existingIndex].quantity + Number(quantity);
    if (newQty > product.stockCount) {
      res.status(400);
      throw new Error(
        `Only ${product.stockCount} units available. You already have ${cart.items[existingIndex].quantity} in your cart.`
      );
    }
    cart.items[existingIndex].quantity = newQty;
  } else {
    if (Number(quantity) > product.stockCount) {
      res.status(400);
      throw new Error(`Only ${product.stockCount} units available`);
    }
    cart.items.push({
      productId: product._id,
      sku: product.sku,
      name: product.name,
      image: product.image,
      brand: product.brand,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity: Number(quantity),
    });
  }

  await cart.save();
  return sendResponse(res, 200, true, 'Item added to cart', cart);
});

// PATCH /api/cart/items/:productId  — update quantity of an item
const updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity == null || Number(quantity) < 0) {
    res.status(400);
    throw new Error('Valid quantity required (0 to remove)');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const index = cart.items.findIndex(
    (i) => i.productId.toString() === productId
  );

  if (index < 0) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  if (Number(quantity) === 0) {
    cart.items.splice(index, 1);
  } else {
    // Stock check
    const product = await Product.findById(productId)
      .select('stockCount')
      .lean();
    if (product && Number(quantity) > product.stockCount) {
      res.status(400);
      throw new Error(`Only ${product.stockCount} units available`);
    }
    cart.items[index].quantity = Number(quantity);
  }

  await cart.save();
  return sendResponse(res, 200, true, 'Cart updated', cart);
});

// DELETE /api/cart/items/:productId  — remove a single item
const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);

  await cart.save();
  return sendResponse(res, 200, true, 'Item removed from cart', cart);
});

// DELETE /api/cart  — clear entire cart
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return sendResponse(res, 200, true, 'Cart already empty', { items: [] });
  }

  cart.items = [];
  await cart.save();
  return sendResponse(res, 200, true, 'Cart cleared', cart);
});

// POST /api/cart/checkout  — mock checkout (clears cart, returns order summary)
const checkout = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const subtotal = cart.subtotal;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const orderNumber = `ORD-${Date.now()}`;

  const order = await Order.create({
    user: req.user._id,
    orderNumber,
    items: cart.items,
    status: 'pending',
    subtotal,
    tax,
    total,
    trackingNumber: `TRK-${Date.now()}`,
  });

  // Clear cart after checkout
  cart.items = [];
  await cart.save();

  return sendResponse(res, 200, true, 'Order placed successfully', {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    trackingNumber: order.trackingNumber,
    placedAt: order.createdAt,
  });
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  checkout,
};
