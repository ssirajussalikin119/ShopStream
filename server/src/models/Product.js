const mongoose = require("mongoose");

// Define the structure for Product document in MongoDB
const productSchema = new mongoose.Schema(
  {
    // Product name (e.g., "Wireless Noise Cancelling Headphones")
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    // Product description/details
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Brand name (e.g., "Premium Tech", "Samsung")
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },

    // Product price in dollars
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Product image URL
    image: {
      type: String,
      required: [true, "Product image is required"],
    },

    // Reference to Category model (stores category ID)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    // Product rating (0-5)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Number of reviews
    reviewCount: {
      type: Number,
      default: 0,
    },

    // Stock quantity available
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: 0,
      default: 0,
    },

    // Mark as featured product (for homepage display)
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Whether this product is active/visible
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

// Create and export the Product model
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
