// Seeding script to populate MongoDB with test data
// Run this once to add categories and products to the database
// Command: node seed.js (run from server folder)

const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./src/models/Category");
const Product = require("./src/models/Product");

// Test data
const testCategories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Latest electronics and gadgets",
    image:
      "https://plus.unsplash.com/premium_photo-1683120889995-b6a309252981?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Trendy fashion and clothing",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Home Decor",
    slug: "home-decor",
    description: "Beautiful home decoration items",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Gadgets",
    slug: "gadgets",
    description: "Smart gadgets and devices",
    image:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=721&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const testProducts = [
  {
    name: "Wireless Noise Cancelling Headphones",
    brand: "Premium Tech",
    description:
      "High-quality wireless headphones with active noise cancelling",
    price: 249.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    rating: 4.8,
    reviewCount: 245,
    stock: 50,
    isFeatured: true,
  },
  {
    name: "Ultra HD 4K Webcam",
    brand: "ClarityVision",
    description: "Professional 4K webcam for streaming and conferencing",
    price: 179.99,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    rating: 4.6,
    reviewCount: 128,
    stock: 35,
    isFeatured: true,
  },
  {
    name: "Smart Watch Pro",
    brand: "TechWear",
    description: "Advanced smartwatch with health tracking",
    price: 329.99,
    image:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
    category: "Gadgets",
    rating: 4.7,
    reviewCount: 312,
    stock: 45,
    isFeatured: true,
  },
  {
    name: "Mechanical Gaming Keyboard",
    brand: "GearMaster",
    description: "RGB mechanical keyboard for gaming and work",
    price: 129.99,
    image:
      "https://plus.unsplash.com/premium_photo-1679513691474-73102089c117?q=80&w=2013&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Electronics",
    rating: 4.9,
    reviewCount: 456,
    stock: 60,
    isFeatured: true,
  },
  {
    name: "Portable Phone Stand",
    brand: "MobileHive",
    description: "Adjustable phone stand for all devices",
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    category: "Gadgets",
    rating: 4.5,
    reviewCount: 89,
    stock: 100,
    isFeatured: true,
  },
  {
    name: "USB-C Hub Multi-Port",
    brand: "ConnectPro",
    description: "7-in-1 USB Hub with multiple ports",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    rating: 4.4,
    reviewCount: 167,
    stock: 75,
    isFeatured: false,
  },
  {
    name: "Organic Cotton T-Shirt",
    brand: "StyleComfort",
    description: "100% organic cotton premium quality t-shirt",
    price: 39.99,
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
    category: "Fashion",
    rating: 4.3,
    reviewCount: 203,
    stock: 120,
    isFeatured: false,
  },
  {
    name: "Ceramic Table Lamp",
    brand: "LuminaHome",
    description: "Modern ceramic table lamp with warm lighting",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    category: "Home Decor",
    rating: 4.7,
    reviewCount: 134,
    stock: 25,
    isFeatured: false,
  },
];

// Run seeding
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost/shopstream",
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert categories
    const savedCategories = await Category.insertMany(testCategories);
    console.log(`✅ Added ${savedCategories.length} categories`);

    // Insert products (map category names to IDs)
    const productsWithCategoryIds = testProducts.map((product) => {
      const category = savedCategories.find(
        (cat) => cat.name === product.category,
      );
      return {
        ...product,
        category: category._id,
      };
    });

    const savedProducts = await Product.insertMany(productsWithCategoryIds);
    console.log(`✅ Added ${savedProducts.length} products`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("📱 Refresh your browser to see the data!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
