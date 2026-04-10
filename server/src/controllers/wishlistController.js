const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }
  return wishlist;
};

// GET /api/wishlist - fetch wishlist for current user
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  return sendResponse(
    res,
    200,
    true,
    'Wishlist fetched successfully',
    wishlist
  );
});

// POST /api/wishlist/items - add product to wishlist
const addWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return sendResponse(res, 400, false, 'productId is required');
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    return sendResponse(res, 404, false, 'Product not found');
  }

  const wishlist = await getOrCreateWishlist(req.user._id);
  const alreadyExists = wishlist.items.some(
    (item) => item.productId.toString() === productId
  );

  if (alreadyExists) {
    return sendResponse(
      res,
      200,
      true,
      'Product already in wishlist',
      wishlist
    );
  }

  wishlist.items.unshift({
    productId: product._id,
    sku: product.sku,
    name: product.name,
    image: product.image,
    brand: product.brand,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    inStock: product.inStock,
    addedAt: new Date(),
  });

  await wishlist.save();

  return sendResponse(res, 200, true, 'Item added to wishlist', wishlist);
});

// DELETE /api/wishlist/items/:productId - remove from wishlist
const removeWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await getOrCreateWishlist(req.user._id);
  wishlist.items = wishlist.items.filter(
    (item) => item.productId.toString() !== productId
  );

  await wishlist.save();

  return sendResponse(res, 200, true, 'Item removed from wishlist', wishlist);
});

module.exports = {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
};
