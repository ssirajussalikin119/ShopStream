const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: null },
    inStock: { type: Boolean, default: true },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [wishlistItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

wishlistSchema.virtual('itemCount').get(function () {
  return this.items.length;
});

wishlistSchema.set('toJSON', { virtuals: true });
wishlistSchema.set('toObject', { virtuals: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
